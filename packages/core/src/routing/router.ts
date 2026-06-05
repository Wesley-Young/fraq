/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
import type * as types from '../protocol/types';
import type { Parameter } from './parameter';
import { Tokenizer } from './tokenizer';

export type Pattern = Record<string, Parameter<any>>;
export type ParamsOf<P extends Pattern> = { [K in keyof P]: P[K] extends Parameter<infer T> ? T : never };
export type Executor<P extends Pattern> = (session: Session, params: ParamsOf<P>) => void | Promise<void>;
export type SessionPredicate = (session: Session) => boolean;

export interface Command<P extends Pattern> {
  name: string;
  pattern: P;
  execute: Executor<P>;
}

export interface RawPattern<P extends Pattern> {
  pattern: P;
  execute: Executor<P>;
}

export type RouteEntry =
  | { type: 'command'; command: Command<Pattern> }
  | { type: 'group'; name: string; router: Router }
  | { type: 'filter'; predicate: SessionPredicate; router: Router }
  | { type: 'rawPattern'; rawPattern: RawPattern<Pattern> };

export type RouteBranch =
  | { type: 'command'; path: string[]; command: Command<Pattern> }
  | { type: 'rawPattern'; path: string[]; rawPattern: RawPattern<Pattern> };

export type RouteMatchResult =
  | { type: 'command'; path: string[]; command: Command<Pattern>; params: any }
  | { type: 'rawPattern'; path: string[]; rawPattern: RawPattern<Pattern>; params: any };

export interface Session {
  raw: types.IncomingMessage;
  reply(segments: types.OutgoingSegment_ZodInput[]): Promise<void>;
}

export class Router {
  private readonly entries: RouteEntry[] = [];
  private readonly groups = new Map<string, Router>();

  command<P extends Pattern>(command: Command<P>): this {
    // @ts-expect-error
    this.entries.push({ type: 'command', command });
    return this;
  }

  rawPattern<P extends Pattern>(rawPattern: RawPattern<P>): this {
    if (Object.keys(rawPattern.pattern).length === 0) {
      throw new Error('Raw pattern must have at least one parameter.');
    }
    const firstKey = Object.keys(rawPattern.pattern)[0];
    if (rawPattern.pattern[firstKey].capturer.typeInstruction.type === 'literal') {
      throw new Error(
        'The first parameter of a raw pattern cannot be a literal, as it would conflict with command patterns.',
      );
    }
    // @ts-expect-error
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

  routes(): RouteEntry[] {
    return this.entries;
  }

  branches(session: Session): RouteBranch[] {
    return this.branchesFrom(session, []);
  }

  match(session: Session, message: types.IncomingMessage): RouteMatchResult | undefined {
    const tokenizer = new Tokenizer(message.segments);
    return this.matchFrom(session, tokenizer, []);
  }

  async dispatch(session: Session, message: types.IncomingMessage): Promise<boolean> {
    const match = this.match(session, message);
    if (match === undefined) {
      return false;
    }
    switch (match.type) {
      case 'command':
        await match.command.execute(session, match.params);
        break;
      case 'rawPattern':
        await match.rawPattern.execute(session, match.params);
        break;
    }
    return true;
  }

  private matchFrom(session: Session, tokenizer: Tokenizer, path: string[]): RouteMatchResult | undefined {
    const initialState = tokenizer.getState();

    for (const entry of this.entries) {
      tokenizer.setState(initialState);

      const match = this.matchEntry(entry, session, tokenizer, path);
      if (match !== undefined) {
        return match;
      }
    }

    tokenizer.setState(initialState);
    return undefined;
  }

  private matchEntry(
    entry: RouteEntry,
    session: Session,
    tokenizer: Tokenizer,
    path: string[],
  ): RouteMatchResult | undefined {
    switch (entry.type) {
      case 'command':
        return this.matchCommand(entry.command, tokenizer, path);
      case 'group':
        return this.matchGroup(entry.name, entry.router, session, tokenizer, path);
      case 'filter':
        if (entry.predicate(session) !== true) {
          return undefined;
        }
        return entry.router.matchFrom(session, tokenizer, path);
      case 'rawPattern':
        return this.matchRawPattern(entry.rawPattern, tokenizer, path);
    }
  }

  private matchCommand(command: Command<Pattern>, tokenizer: Tokenizer, path: string[]): RouteMatchResult | undefined {
    const token = tokenizer.peek();
    if (typeof token !== 'string' || token !== command.name) {
      return undefined;
    }

    tokenizer.next();
    const params = this.capturePattern(command.pattern, tokenizer);
    if (params === undefined || tokenizer.hasNext()) {
      return undefined;
    }

    return { type: 'command', path: [...path], command, params };
  }

  private matchGroup(
    name: string,
    router: Router,
    session: Session,
    tokenizer: Tokenizer,
    path: string[],
  ): RouteMatchResult | undefined {
    const token = tokenizer.peek();
    if (typeof token !== 'string' || token !== name) {
      return undefined;
    }

    tokenizer.next();
    return router.matchFrom(session, tokenizer, [...path, name]);
  }

  private matchRawPattern(
    rawPattern: RawPattern<Pattern>,
    tokenizer: Tokenizer,
    path: string[],
  ): RouteMatchResult | undefined {
    const params = this.capturePattern(rawPattern.pattern, tokenizer);
    if (params === undefined || tokenizer.hasNext()) {
      return undefined;
    }

    return { type: 'rawPattern', path: [...path], rawPattern, params };
  }

  private branchesFrom(session: Session, path: string[]): RouteBranch[] {
    const branches: RouteBranch[] = [];

    for (const entry of this.entries) {
      switch (entry.type) {
        case 'command':
          branches.push({ type: 'command', path: [...path], command: entry.command });
          break;
        case 'group':
          branches.push(...entry.router.branchesFrom(session, [...path, entry.name]));
          break;
        case 'filter':
          if (entry.predicate(session) === true) {
            branches.push(...entry.router.branchesFrom(session, path));
          }
          break;
        case 'rawPattern':
          branches.push({ type: 'rawPattern', path: [...path], rawPattern: entry.rawPattern });
          break;
      }
    }

    return branches;
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
