const PCG32_MULTIPLIER = 6_364_136_223_846_793_005n;
const UINT64_MASK = (1n << 64n) - 1n;

export interface PCG32State {
  state: bigint;
  increment: bigint;
}

export interface PCG32Options {
  seed?: bigint;
  sequence?: bigint;
}

function rotateRight32(value: number, rotation: number): number {
  const amount = rotation & 31;
  if (amount === 0) {
    return value >>> 0;
  }
  return ((value >>> amount) | (value << (32 - amount))) >>> 0;
}

export class PCG32 {
  private state: bigint;
  private readonly increment: bigint;

  constructor(state: PCG32State);
  constructor(options?: PCG32Options);
  constructor(optionsOrState: PCG32Options | PCG32State = {}) {
    if ('state' in optionsOrState && 'increment' in optionsOrState) {
      this.state = optionsOrState.state & UINT64_MASK;
      this.increment = optionsOrState.increment & UINT64_MASK;
      return;
    }

    const seed = optionsOrState.seed ?? 0n;
    const sequence = optionsOrState.sequence ?? 1n;

    this.state = 0n;
    this.increment = ((sequence << 1n) | 1n) & UINT64_MASK;
    this.nextUint32();
    this.state = (this.state + seed) & UINT64_MASK;
    this.nextUint32();
  }

  nextUint32(): number {
    const currentState = this.state;
    this.state = (currentState * PCG32_MULTIPLIER + this.increment) & UINT64_MASK;

    const xorshifted = Number((((currentState >> 18n) ^ currentState) >> 27n) & 0xffff_ffffn);
    const rotation = Number((currentState >> 59n) & 31n);

    return rotateRight32(xorshifted, rotation);
  }

  clone(): PCG32 {
    return new PCG32(this.exportState());
  }

  exportState(): PCG32State {
    return {
      state: this.state,
      increment: this.increment,
    };
  }
}
