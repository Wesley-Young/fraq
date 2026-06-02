import {
  type Context,
  type milky,
  type ParamsOf,
  type Pattern,
  type RouteBranch,
  type RouteMatchResult,
  Router,
  type Session,
} from '@fraqjs/fraq';

import { ConversationAbortionError, ConversationRejectionError } from './error';

export interface ConversationServiceOptions {
  defaultTimeout?: number;
  onCollision?: 'reject-incoming' | 'abort-existing';
}

export interface ConversationCommandScope {
  open<R>(
    handler: (conversationContext: ConversationContext<R>) => void | Promise<void>,
    options?: ConversationOptions,
  ): Promise<R | null>;
}

export interface ConversationContext<R> {
  session: Session;
  router: Router;
  done(result: R): void;
  abort(reason?: string): void;
}

export interface ConversationOptions {
  timeout?: number;
}

interface ActiveConversation<R> {
  readonly key: string;
  readonly session: Session;
  readonly branch: RouteBranch;
  readonly router: Router;
  readonly options?: ConversationOptions;
  readonly resolve: (result: R | null) => void;
  readonly reject: (error: unknown) => void;
  ready: Promise<void>;
  settled: boolean;
  timeoutId?: ReturnType<typeof setTimeout>;
}

function conversationKey(raw: milky.IncomingMessage): string {
  return `${raw.sender_id}:${raw.message_scene}:${raw.peer_id}`;
}

function assertPositiveTimeout(timeout: number, name: string): void {
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}

function isSame(a: milky.IncomingMessage, b: milky.IncomingMessage): boolean {
  return (
    a.message_scene === b.message_scene &&
    a.peer_id === b.peer_id &&
    a.sender_id === b.sender_id &&
    a.message_seq === b.message_seq
  );
}

function branchFromMatch(match: RouteMatchResult): RouteBranch {
  switch (match.type) {
    case 'command':
      return { type: 'command', path: match.path, command: match.command };
    case 'rawPattern':
      return { type: 'rawPattern', path: match.path, rawPattern: match.rawPattern };
  }
}

function isSameBranch(a: RouteBranch, b: RouteBranch): boolean {
  if (a.path.length !== b.path.length || !a.path.every((part, index) => part === b.path[index])) {
    return false;
  }
  switch (a.type) {
    case 'command':
      if (b.type !== 'command') {
        return false;
      }
      return a.command === b.command;
    case 'rawPattern':
      if (b.type !== 'rawPattern') {
        return false;
      }
      return a.rawPattern === b.rawPattern;
  }
}

export class ConversationService {
  readonly defaultTimeout: number;
  readonly onCollision: 'reject-incoming' | 'abort-existing';

  private readonly router = new Router();
  private readonly activeConversations = new Map<string, ActiveConversation<unknown>>();

  constructor(
    private readonly ctx: Context,
    options?: ConversationServiceOptions,
  ) {
    this.defaultTimeout = options?.defaultTimeout ?? 30000;
    assertPositiveTimeout(this.defaultTimeout, 'defaultTimeout');
    this.onCollision = options?.onCollision ?? 'reject-incoming';

    ctx.on('message_receive', ({ data }) => {
      void this.accept(data);
    });
  }

  command<P extends Pattern>(
    name: string,
    pattern: P,
    handler: (session: Session, params: ParamsOf<P>, scope: ConversationCommandScope) => void | Promise<void>,
  ): this {
    let branch: RouteBranch | undefined;
    this.router.command(name, pattern, (session, params) => {
      const registeredBranch = branch;
      if (!registeredBranch) {
        throw new Error(`Conversation command "${name}" was not registered correctly.`);
      }
      return handler(session, params, {
        open: (conversationHandler, options) =>
          this.openFromCommand(session, registeredBranch, conversationHandler, options),
      });
    });
    const entry = this.router.routes().at(-1);
    if (entry?.type !== 'command') {
      throw new Error(`Conversation command "${name}" was not registered correctly.`);
    }
    branch = { type: 'command', path: [], command: entry.command };
    return this;
  }

  private async openFromCommand<R>(
    session: Session,
    branch: RouteBranch,
    handler: (conversationContext: ConversationContext<R>) => void | Promise<void>,
    options?: ConversationOptions,
  ): Promise<R | null> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    assertPositiveTimeout(timeout, 'timeout');

    const key = conversationKey(session.raw);
    const existing = this.activeConversations.get(key);
    if (existing) {
      if (this.onCollision === 'reject-incoming') {
        return Promise.reject(new ConversationRejectionError('conversation already active'));
      }
      this.abort(existing, 'aborted due to new conversation');
    }

    return new Promise((resolve, reject) => {
      const active: ActiveConversation<R> = {
        key,
        session,
        branch,
        router: new Router(),
        options,
        resolve,
        reject,
        ready: Promise.resolve()
          .then(() =>
            handler({
              session,
              router: active.router,
              done: (result) => this.resolve(active, result),
              abort: (reason) => this.abort(active, reason),
            }),
          )
          .catch((error) => {
            this.reject(active, error);
          }),
        settled: false,
      };

      active.timeoutId = setTimeout(() => {
        this.resolve(active, null);
      }, timeout);

      this.activeConversations.set(key, active as ActiveConversation<unknown>);
    });
  }

  private async accept(raw: milky.IncomingMessage): Promise<void> {
    const session = this.ctx.createSession(raw);
    const commandMatch = this.router.match(session, raw);
    const commandBranch = commandMatch ? branchFromMatch(commandMatch) : undefined;
    const active = this.activeConversations.get(conversationKey(raw));
    if (!active || active.settled) {
      await this.dispatchCommand(commandMatch, session);
      return;
    }

    if (
      commandBranch &&
      isSameBranch(active.branch, commandBranch) &&
      this.onCollision === 'abort-existing' &&
      !isSame(active.session.raw, raw)
    ) {
      this.abort(active, 'aborted due to new conversation');
      await this.dispatchCommand(commandMatch, session);
      return;
    }

    await this.dispatchActive(active, raw);
  }

  private async dispatchCommand(match: RouteMatchResult | undefined, session: Session): Promise<void> {
    if (match?.type !== 'command') {
      return;
    }
    try {
      await match.command.handler(session, match.params);
    } catch (error) {
      this.ctx.logger.error(
        `Error routing conversation command (scene=${session.raw.message_scene} peer=${session.raw.peer_id} sender=${session.raw.sender_id} seq=${session.raw.message_seq})`,
        error,
      );
    }
  }

  private async dispatchActive(active: ActiveConversation<unknown>, raw: milky.IncomingMessage): Promise<void> {
    if (isSame(active.session.raw, raw)) {
      return;
    }
    await active.ready;
    if (this.activeConversations.get(active.key) !== active || active.settled) {
      return;
    }
    const session = { ...active.session, raw };
    try {
      await active.router.dispatch(session, raw);
    } catch (error) {
      this.reject(active, error);
      return;
    }
  }

  private resolve<R>(active: ActiveConversation<R>, result: R | null): void {
    this.settle(active, () => active.resolve(result));
  }

  private reject<R>(active: ActiveConversation<R>, error: unknown): void {
    this.settle(active, () => active.reject(error));
  }

  private abort<R>(active: ActiveConversation<R>, reason?: string): void {
    this.reject(active, new ConversationAbortionError(reason ?? 'conversation aborted'));
  }

  private settle<R>(active: ActiveConversation<R>, onSettled: () => void): void {
    if (active.settled) {
      return;
    }

    active.settled = true;
    if (active.timeoutId) {
      clearTimeout(active.timeoutId);
      active.timeoutId = undefined;
    }
    if (this.activeConversations.get(active.key) === active) {
      this.activeConversations.delete(active.key);
    }
    onSettled();
  }
}
