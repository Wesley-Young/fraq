import { type Capturer, capturer } from './capturer';
import type { Token } from './tokenizer';

export class Parameter<T> {
  description?: string;

  constructor(
    public readonly capturer: Capturer<T>,
  ) {}

  describe(description: string): this {
    this.description = description;
    return this;
  }
}

export namespace param {
  export function literal<T extends string>(literal: T): Parameter<T> {
    return new Parameter(capturer.literal(literal));
  }

  export function num(): Parameter<number> {
    return new Parameter(capturer.num);
  }

  export function str(): Parameter<string> {
    return new Parameter(capturer.str);
  }

  export function greedy(): Parameter<string> {
    return new Parameter(capturer.greedy);
  }

  export function union<T extends string>(...literals: T[]): Parameter<T> {
    return new Parameter(capturer.union(...literals));
  }

  export function segment<T extends Exclude<Token, string>['type']>(
    type: T,
  ): Parameter<Extract<Token, { type: T }>> {
    return new Parameter(capturer.segment(type));
  }
}
