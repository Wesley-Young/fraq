import type { Token, Tokenizer } from './tokenizer';

export interface Capturer<T> {
  typeInstruction: TypeInstruction;
  capture(tokenizer: Tokenizer): T | undefined;
}

export type TypeInstruction =
  | { type: 'literal'; literal: string }
  | { type: 'number' }
  | { type: 'string' }
  | { type: 'greedy' }
  | { type: 'union'; members: string[] }
  | { type: 'segment'; segmentType: Exclude<Token, string>['type'] };

export class Parameter<T> {
  description?: string;

  constructor(public readonly capturer: Capturer<T>) {}

  describe(description: string): this {
    this.description = description;
    return this;
  }
}

export namespace param {
  export function literal<T extends string>(literal: T): Parameter<T> {
    return new Parameter({
      typeInstruction: {
        type: 'literal',
        literal: literal,
      },
      capture(tokenizer: Tokenizer): T | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string' && token === literal) {
          tokenizer.next();
          return token as T;
        }
        return undefined;
      },
    });
  }

  export function num(): Parameter<number> {
    return new Parameter({
      typeInstruction: { type: 'number' },
      capture(tokenizer: Tokenizer): number | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string') {
          const parsed = Number(token);
          if (!Number.isNaN(parsed)) {
            tokenizer.next();
            return parsed;
          }
        }
        return undefined;
      },
    });
  }

  export function str(): Parameter<string> {
    return new Parameter({
      typeInstruction: { type: 'string' },
      capture(tokenizer: Tokenizer): string | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string') {
          tokenizer.next();
          return token;
        }
        return undefined;
      },
    });
  }

  export function greedy(): Parameter<string> {
    return new Parameter({
      typeInstruction: { type: 'greedy' },
      capture(tokenizer: Tokenizer): string | undefined {
        if (tokenizer.isGreedyAvailable()) {
          return tokenizer.greedy();
        }
        return undefined;
      },
    });
  }

  export function union<T extends string>(...literals: T[]): Parameter<T> {
    const literalSet = new Set<string>(literals);
    return new Parameter({
      typeInstruction: {
        type: 'union',
        members: literals,
      },
      capture(tokenizer: Tokenizer): T | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string' && literalSet.has(token)) {
          tokenizer.next();
          return token as T;
        }
        return undefined;
      },
    });
  }

  export function segment<T extends Exclude<Token, string>['type']>(type: T): Parameter<Extract<Token, { type: T }>> {
    return new Parameter({
      typeInstruction: {
        type: 'segment',
        segmentType: type,
      },
      capture(tokenizer: Tokenizer): Extract<Token, { type: T }> | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'object' && token !== null && token.type === type) {
          tokenizer.next();
          return token as Extract<Token, { type: T }>;
        }
        return undefined;
      },
    });
  }
}
