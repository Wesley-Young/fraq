/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
import type * as types from '../protocol/types';
import type { Parameter } from './parameter';
import { Tokenizer } from './tokenizer';

export type Pattern = Record<string, Parameter<any>>;
export type ParamsOf<P extends Pattern> = { [K in keyof P]: P[K] extends Parameter<infer T> ? T : never };
export type Handler<P extends Pattern> = (session: Session, params: ParamsOf<P>) => void | Promise<void>;
export type SessionPredicate = (session: Session) => boolean;

export interface Command {
  name: string;
  pattern: Pattern;
  handler: (session: Session, params: any) => void | Promise<void>;
}

export interface RawPattern {
  pattern: Pattern;
  handler: (session: Session, params: any) => void | Promise<void>;
}

export type RouteEntry =
  | { type: 'command'; command: Command }
  | { type: 'group'; name: string; router: Router }
  | { type: 'filter'; predicate: SessionPredicate; router: Router }
  | { type: 'rawPattern'; rawPattern: RawPattern };

export interface Session {
  raw: types.IncomingMessage;
  reply(segments: types.OutgoingSegment_ZodInput[]): Promise<void>;
}

export class Router {
  private readonly entries: RouteEntry[] = [];
  private readonly groups = new Map<string, Router>();

  command<P extends Pattern>(name: string, pattern: P, handler: Handler<P>): this {
    const command: Command = { name, pattern, handler };
    this.entries.push({ type: 'command', command });
    return this;
  }

  rawPattern<P extends Pattern>(pattern: P, handler: Handler<P>): this {
    if (Object.keys(pattern).length === 0) {
      throw new Error('Raw pattern must have at least one parameter.');
    }
    const firstKey = Object.keys(pattern)[0];
    if (pattern[firstKey].capturer.typeInstruction.type === 'literal') {
      throw new Error(
        'The first parameter of a raw pattern cannot be a literal, as it would conflict with command patterns.',
      );
    }

    const rawPattern: RawPattern = { pattern, handler };
    this.entries.push({ type: 'rawPattern', rawPattern });

    return this;
  }

  group(name: string): Router {
    let router = this.groups.get(name);
    if (!router) {
      router = new Router();
      this.groups.set(name, router);
      this.entries.push({ type: 'group', name, router });
    }
    return router;
  }

  filter(predicate: SessionPredicate): Router {
    const router = new Router();
    this.entries.push({ type: 'filter', predicate: predicate, router });
    return router;
  }

  async dispatch(session: Session, message: types.IncomingMessage): Promise<boolean> {
    const tokenizer = new Tokenizer(message.segments);
    return await this.process(session, tokenizer);
  }

  private async process(session: Session, tokenizer: Tokenizer): Promise<boolean> {
    const initialState = tokenizer.getState();

    for (const entry of this.entries) {
      tokenizer.setState(initialState);

      if (await this.processEntry(entry, session, tokenizer)) {
        return true;
      }
    }

    tokenizer.setState(initialState);
    return false;
  }

  private async processEntry(entry: RouteEntry, session: Session, tokenizer: Tokenizer): Promise<boolean> {
    switch (entry.type) {
      case 'command':
        return await this.processCommand(entry.command, session, tokenizer);
      case 'group':
        return await this.processGroup(entry.name, entry.router, session, tokenizer);
      case 'filter':
        if (entry.predicate(session) !== true) {
          return false;
        }
        return await entry.router.process(session, tokenizer);
      case 'rawPattern':
        return await this.processRawPattern(entry.rawPattern, session, tokenizer);
    }
  }

  private async processCommand(command: Command, session: Session, tokenizer: Tokenizer): Promise<boolean> {
    const token = tokenizer.peek();
    if (typeof token !== 'string' || token !== command.name) {
      return false;
    }

    tokenizer.next();
    const params = this.capturePattern(command.pattern, tokenizer);
    if (params === undefined || tokenizer.hasNext()) {
      return false;
    }

    await command.handler(session, params);
    return true;
  }

  private async processGroup(name: string, router: Router, session: Session, tokenizer: Tokenizer): Promise<boolean> {
    const token = tokenizer.peek();
    if (typeof token !== 'string' || token !== name) {
      return false;
    }

    tokenizer.next();
    return await router.process(session, tokenizer);
  }

  private async processRawPattern(rawPattern: RawPattern, session: Session, tokenizer: Tokenizer): Promise<boolean> {
    const params = this.capturePattern(rawPattern.pattern, tokenizer);
    if (params === undefined || tokenizer.hasNext()) {
      return false;
    }

    await rawPattern.handler(session, params);
    return true;
  }

  private capturePattern<P extends Pattern>(pattern: P, tokenizer: Tokenizer): ParamsOf<P> | undefined {
    const initialState = tokenizer.getState();
    const params = {} as ParamsOf<P>;

    for (const [name, parameter] of Object.entries(pattern)) {
      const value = parameter.capturer.capture(tokenizer);
      if (value === undefined) {
        tokenizer.setState(initialState);
        return undefined;
      }
      params[name as keyof P] = value;
    }

    return params;
  }
}
