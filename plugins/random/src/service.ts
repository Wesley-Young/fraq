import { PCG32, type PCG32State } from './pcg32';

const DEFAULT_SEQUENCE = 1;
const UINT32_MODULUS = 2 ** 32;

export interface RandomServiceOptions {
  seed?: number;
  sequence?: number;
}

export type RandomState = PCG32State;

function assertSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a safe integer.`);
  }
}

function toBigInt(value: number, name: string): bigint {
  assertSafeInteger(value, name);
  return BigInt(value);
}

function assertProbability(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError('probability must be a finite number between 0 and 1.');
  }
}

function assertNonEmpty<T>(items: readonly T[]): void {
  if (items.length === 0) {
    throw new RangeError('items must not be empty.');
  }
}

function assertWeight(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite number greater than or equal to 0.`);
  }
}

export class RandomService {
  private generator: PCG32;
  private sequence: number;

  constructor(options?: RandomServiceOptions) {
    const seed = options?.seed ?? Math.floor(Math.random() * UINT32_MODULUS);
    const initialSequence = options?.sequence ?? DEFAULT_SEQUENCE;
    this.generator = new PCG32({
      seed: toBigInt(seed, 'seed'),
      sequence: toBigInt(initialSequence, 'sequence'),
    });
    this.sequence = initialSequence;
  }

  uint32(): number {
    return this.generator.nextUint32();
  }

  float(): number {
    return this.uint32() / 2 ** 32;
  }

  bool(probability = 0.5): boolean {
    assertProbability(probability);
    return this.float() < probability;
  }

  int(maxExclusive: number): number;
  int(minInclusive: number, maxExclusive: number): number;
  int(minOrMax: number, maxExclusive?: number): number {
    const minInclusive = maxExclusive === undefined ? 0 : minOrMax;
    const actualMaxExclusive = maxExclusive ?? minOrMax;

    assertSafeInteger(minInclusive, 'minInclusive');
    assertSafeInteger(actualMaxExclusive, 'maxExclusive');
    if (actualMaxExclusive <= minInclusive) {
      throw new RangeError('maxExclusive must be greater than minInclusive.');
    }

    const span = actualMaxExclusive - minInclusive;
    if (span > UINT32_MODULUS) {
      throw new RangeError(`range size must be less than or equal to ${UINT32_MODULUS}.`);
    }

    const limit = Math.floor(UINT32_MODULUS / span) * span;
    let value = this.uint32();
    while (value >= limit) {
      value = this.uint32();
    }

    return minInclusive + (value % span);
  }

  range(minInclusive: number, maxInclusive: number): number {
    assertSafeInteger(minInclusive, 'minInclusive');
    assertSafeInteger(maxInclusive, 'maxInclusive');
    if (maxInclusive < minInclusive) {
      throw new RangeError('maxInclusive must be greater than or equal to minInclusive.');
    }

    const span = maxInclusive - minInclusive + 1;
    if (span > UINT32_MODULUS) {
      throw new RangeError(`range size must be less than or equal to ${UINT32_MODULUS}.`);
    }

    return minInclusive + this.int(span);
  }

  pick<T>(items: readonly T[]): T {
    assertNonEmpty(items);
    return items[this.int(items.length)] as T;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = this.int(index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex] as T, shuffled[index] as T];
    }
    return shuffled;
  }

  sample<T>(items: readonly T[], count: number): T[] {
    assertSafeInteger(count, 'count');
    if (count < 0 || count > items.length) {
      throw new RangeError('count must be between 0 and items.length.');
    }

    const pool = [...items];
    for (let index = 0; index < count; index += 1) {
      const swapIndex = this.int(index, pool.length);
      [pool[index], pool[swapIndex]] = [pool[swapIndex] as T, pool[index] as T];
    }
    return pool.slice(0, count);
  }

  weightedIndex(weights: readonly number[]): number {
    assertNonEmpty(weights);

    let totalWeight = 0;
    let lastPositiveIndex = -1;
    for (const [index, weight] of weights.entries()) {
      assertWeight(weight, `weights[${index}]`);
      totalWeight += weight;
      if (weight > 0) {
        lastPositiveIndex = index;
      }
    }

    if (lastPositiveIndex === -1) {
      throw new RangeError('weights must contain at least one positive value.');
    }

    const target = this.float() * totalWeight;
    let cumulative = 0;
    for (const [index, weight] of weights.entries()) {
      cumulative += weight;
      if (target < cumulative) {
        return index;
      }
    }

    return lastPositiveIndex;
  }

  weightedPick<T>(items: readonly T[], weightOf: (item: T) => number): T {
    assertNonEmpty(items);

    const weights = items.map((item, index) => {
      const weight = weightOf(item);
      assertWeight(weight, `weightOf(items[${index}])`);
      return weight;
    });

    return items[this.weightedIndex(weights)] as T;
  }

  clone(): RandomService {
    return RandomService.fromGenerator(this.generator.clone(), this.sequence);
  }

  exportState(): RandomState {
    return this.generator.exportState();
  }

  withSeed(seed: number): RandomService {
    return new RandomService({
      seed,
      sequence: this.sequence,
    });
  }

  static fromState(state: RandomState): RandomService {
    return RandomService.fromGenerator(new PCG32(state), Number((state.increment >> 1n) & ((1n << 63n) - 1n)));
  }

  private static fromGenerator(generator: PCG32, sequence: number): RandomService {
    assertSafeInteger(sequence, 'sequence');

    const random = new RandomService({ sequence });
    random.generator = generator;
    random.sequence = sequence;
    return random;
  }
}
