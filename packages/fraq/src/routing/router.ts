/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
/** biome-ignore-all lint/complexity/noBannedTypes: {} is used in CommandBuilder to allow flexible pattern definitions. */
import type * as types from '../protocol/types';
import { type Command, CommandBuilder, type ParamsOf, type Pattern, type RawPattern, type Session } from './command';
import { Tokenizer } from './tokenizer';

export type SessionPredicate = (session: Session) => boolean;

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

export class Router {
  private readonly entries: RouteEntry[] = [];
  private readonly groups = new Map<string, Router>();

  command(name: string): CommandBuilder;
  command<P extends Pattern>(command: Command<P>): this;
  command<P extends Pattern>(command: string | Command<P>): CommandBuilder | this {
    if (typeof command === 'string') {
      return new CommandBuilder(command, (builtCommand): Command<{}> => {
        this.command(builtCommand);
        return builtCommand;
      });
    }
    this.validatePattern(command.pattern);
    this.resolveAliasConflicts(command);
    // @ts-expect-error
    this.entries.push({ type: 'command', command });
    return this;
  }

  rawPattern(): CommandBuilder<{}, RawPattern<{}>>;
  rawPattern<P extends Pattern>(rawPattern: RawPattern<P>): this;
  rawPattern<P extends Pattern>(rawPattern?: RawPattern<P>): CommandBuilder<{}, RawPattern<{}>> | this {
    if (!rawPattern) {
      return new CommandBuilder('', (builtCommand): RawPattern<{}> => {
        // Command extends RawPattern, so compatible to provide a "command" here
        this.rawPattern(builtCommand);
        return builtCommand;
      });
    }
    this.validatePattern(rawPattern.pattern, { rawPattern: true });
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

  aliasesOf(name: string): string[] {
    for (const entry of this.entries) {
      if (entry.type === 'command' && entry.command.name === name) {
        return entry.command.aliases ? [...entry.command.aliases] : [];
      }
    }
    return [];
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
    if (typeof token !== 'string' || (token !== command.name && !(command.aliases?.includes(token)))) {
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
          if (!entry.command.hidden) {
            branches.push({ type: 'command', path: [...path], command: entry.command });
          }
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

  private resolveAliasConflicts<P extends Pattern>(command: Command<P>): void {
    for (const entry of this.entries) {
      if (entry.type !== 'command') continue;
      const existing = entry.command;

      if (existing.aliases?.includes(command.name)) {
        existing.aliases = existing.aliases.filter((a) => a !== command.name);
        console.warn(
          `Command "${command.name}" conflicts with alias of existing command "${existing.name}". The alias "${command.name}" has been removed from "${existing.name}".`,
        );
      }

      if (command.aliases) {
        const dropped: string[] = [];
        for (const alias of command.aliases) {
          if (existing.name === alias) {
            dropped.push(alias);
            console.warn(
              `Alias "${alias}" of command "${command.name}" conflicts with existing command name "${existing.name}". The alias has been dropped.`,
            );
          } else if (existing.aliases?.includes(alias)) {
            existing.aliases = existing.aliases.filter((a) => a !== alias);
            console.warn(
              `Alias "${alias}" of command "${command.name}" conflicts with alias of existing command "${existing.name}". The alias has been removed from "${existing.name}".`,
            );
          }
        }
        if (dropped.length > 0) {
          command.aliases = command.aliases.filter((a) => !dropped.includes(a));
        }
      }
    }
  }

  private validatePattern(pattern: Pattern, options?: { rawPattern?: boolean }): void {
    const entries = Object.entries(pattern);

    if (options?.rawPattern && entries.length === 0) {
      throw new Error('Raw pattern must have at least one parameter.');
    }

    if (options?.rawPattern && entries[0]?.[1].capturer.typeInstruction.type === 'literal') {
      throw new Error(
        'The first parameter of a raw pattern cannot be a literal, as it would conflict with command patterns.',
      );
    }

    const catchAllEntryIndex = entries.findIndex(([, parameter]) => {
      return parameter.capturer.typeInstruction.type === 'catchAll';
    });
    if (catchAllEntryIndex !== -1 && catchAllEntryIndex !== entries.length - 1) {
      throw new Error('Catch-all parameters must be the last parameter in a pattern.');
    }
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
