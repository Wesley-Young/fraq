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
  | { type: 'segment'; segmentType: Exclude<Token, string>['type'] }
  | { type: 'catchAll' };

export namespace capturer {
  export function literal<T extends string>(literal: T): Capturer<T> {
    return {
      typeInstruction: {
        type: 'literal',
        literal,
      },
      capture(tokenizer: Tokenizer): T | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string' && token === literal) {
          tokenizer.next();
          return token as T;
        }
        return undefined;
      },
    };
  }

  export const num: Capturer<number> = {
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
  };

  export const str: Capturer<string> = {
    typeInstruction: { type: 'string' },
    capture(tokenizer: Tokenizer): string | undefined {
      const token = tokenizer.peek();
      if (typeof token === 'string') {
        tokenizer.next();
        return token;
      }
      return undefined;
    },
  };

  export const greedy: Capturer<string> = {
    typeInstruction: { type: 'greedy' },
    capture(tokenizer: Tokenizer): string | undefined {
      if (tokenizer.isGreedyAvailable()) {
        return tokenizer.greedy();
      }
      return undefined;
    },
  };

  export function union<T extends string>(...members: T[]): Capturer<T> {
    const literalSet = new Set<string>(members);
    return {
      typeInstruction: {
        type: 'union',
        members: members,
      },
      capture(tokenizer: Tokenizer): T | undefined {
        const token = tokenizer.peek();
        if (typeof token === 'string' && literalSet.has(token)) {
          tokenizer.next();
          return token as T;
        }
        return undefined;
      },
    };
  }

  export function segment<T extends Exclude<Token, string>['type']>(type: T): Capturer<Extract<Token, { type: T }>> {
    return {
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
    };
  }

  export const catchAll: Capturer<true> = {
    typeInstruction: { type: 'catchAll' },
    capture(tokenizer) {
      while (tokenizer.hasNext()) {
        tokenizer.next()
      }
      return true
    },
  }
}
