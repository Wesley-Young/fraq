import { type Context, type milky, Router, type Session } from '@fraqjs/fraq';

import { ConversationAbortionError, ConversationRejectionError } from './error';

export interface ConversationServiceOptions {
  defaultTimeout?: number;
  onCollision?: 'reject-incoming' | 'abort-existing';
}

export interface ConversationContext<R> {
  session: Session;
  router: Router;
  done(result: R): void;
  abort(reason?: string): void;
}

export interface ConversationOptions {
  timeout?: number;
  onUnmatched?: (raw: milky.IncomingMessage) => void | Promise<void>;
}

interface ActiveConversation<R> {
  readonly key: string;
  readonly session: Session;
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

export class ConversationService {
  readonly defaultTimeout: number;
  readonly onCollision: 'reject-incoming' | 'abort-existing';

  private readonly activeConversations = new Map<string, ActiveConversation<unknown>>();

  constructor(ctx: Context, options?: ConversationServiceOptions) {
    this.defaultTimeout = options?.defaultTimeout ?? 30000;
    assertPositiveTimeout(this.defaultTimeout, 'defaultTimeout');
    this.onCollision = options?.onCollision ?? 'reject-incoming';

    ctx.on('message_receive', ({ data }) => {
      void this.accept(data);
    });
  }

  async open<R>(
    session: Session,
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
      this.abort(existing);
    }

    return new Promise((resolve, reject) => {
      const active: ActiveConversation<R> = {
        key,
        session,
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
    const active = this.activeConversations.get(conversationKey(raw));
    if (!active || active.settled) {
      return;
    }
    if (isSame(active.session.raw, raw)) {
      return;
    }
    await active.ready;
    if (this.activeConversations.get(active.key) !== active || active.settled) {
      return;
    }
    const session = { ...active.session, raw };
    let matched: boolean;
    try {
      matched = await active.router.dispatch(session, raw);
    } catch (error) {
      this.reject(active, error);
      return;
    }
    if (!matched && this.activeConversations.get(active.key) === active && !active.settled) {
      try {
        await active.options?.onUnmatched?.(raw);
      } catch (error) {
        this.reject(active, error);
      }
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
