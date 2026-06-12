/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
/** biome-ignore-all lint/complexity/noBannedTypes: {} is used in CommandBuilder to allow flexible pattern definitions. */
import type * as types from '../protocol/types';
import type { Parameter } from './parameter';

export type Pattern = Record<string, Parameter<any>>;
export type ParamsOf<P extends Pattern> = { [K in keyof P]: P[K] extends Parameter<infer T> ? T : never };
export type Executor<P extends Pattern> = (session: Session, params: ParamsOf<P>) => void | Promise<void>;

export interface Command<P extends Pattern> {
  name: string;
  pattern: P;
  execute: Executor<P>;
  description?: string;
  aliases?: string[];
  hidden?: boolean;
}

export interface RawPattern<P extends Pattern> {
  pattern: P;
  execute: Executor<P>;
}

export interface Session {
  raw: types.IncomingMessage;
  reply(segments: types.OutgoingSegment_ZodInput[]): Promise<void>;
}

export class CommandBuilder<P extends Pattern = {}, S = Command<P>> {
  private readonly pattern: Record<string, Parameter<any>> = {};
  private executor?: Executor<P>;
  private description?: string;
  private aliases?: string[];
  private hidden?: boolean;

  constructor(
    readonly name: string,
    private readonly sink: (command: Command<P>) => S = (command) => command as S,
  ) {}

  arg<K extends string, T>(key: K, parameter: Parameter<T>) {
    this.pattern[key] = parameter;
    return this as CommandBuilder<
      P & { [K2 in K]: Parameter<T> },
      S extends Command<P>
        ? Command<P & { [K2 in K]: Parameter<T> }>
        : S extends RawPattern<P>
          ? RawPattern<P & { [K2 in K]: Parameter<T> }>
          : S
    >;
  }

  describe(description: string) {
    this.description = description;
    return this as CommandBuilder<P, S>;
  }

  alias(...aliases: string[]) {
    if (!this.aliases) {
      this.aliases = [];
    }
    this.aliases.push(...aliases);
    return this as CommandBuilder<P, S>;
  }

  hide() {
    this.hidden = true;
    return this as CommandBuilder<P, S>;
  }

  execute(executor: Executor<P>): S {
    this.executor = executor;
    const command: Command<P> = {
      name: this.name,
      pattern: this.pattern as P,
      execute: this.executor,
    };
    if (this.description !== undefined) {
      command.description = this.description;
    }
    if (this.aliases !== undefined) {
      command.aliases = this.aliases;
    }
    if (this.hidden !== undefined) {
      command.hidden = this.hidden;
    }
    return this.sink(command);
  }
}
