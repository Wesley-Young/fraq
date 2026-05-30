import type { IncomingSegment } from '../protocol/types';

export type Token = string | Exclude<IncomingSegment, { type: 'text' }>;

export interface TokenizerState {
  offset: number;
  subOffset?: number;
}

export class Tokenizer {
  private offset: number = 0;
  // 如果在一个文本消息段内，则 subOffset 表示当前 token 在该文本消息段内的偏移量；
  // 如果不在文本消息段内，则 subOffset 应该为 undefined
  private subOffset?: number = undefined;

  constructor(private readonly segments: IncomingSegment[]) {}

  getState(): TokenizerState {
    return { offset: this.offset, subOffset: this.subOffset };
  }

  setState(state: TokenizerState): void {
    this.offset = state.offset;
    this.subOffset = state.subOffset;
  }

  hasNext(): boolean {
    return this.findNextPosition() !== undefined;
  }

  peek(): Token | undefined {
    const position = this.findNextPosition();
    if (position === undefined) {
      return undefined;
    }

    const segment = this.segments[position.offset];
    if (segment.type === 'text') {
      return this.readTextToken(segment.data.text, position.subOffset ?? 0);
    }

    return segment;
  }

  next(): Token | undefined {
    const position = this.findNextPosition();
    if (position === undefined) {
      return undefined;
    }

    const segment = this.segments[position.offset];
    if (segment.type !== 'text') {
      this.offset = position.offset + 1;
      this.subOffset = undefined;
      return segment;
    }

    const subOffset = position.subOffset ?? 0;
    const token = this.readTextToken(segment.data.text, subOffset);
    const tokenEnd = subOffset + token.length;
    const nextSubOffset = this.findTextTokenStart(segment.data.text, tokenEnd);

    if (nextSubOffset < segment.data.text.length) {
      this.offset = position.offset;
      this.subOffset = nextSubOffset;
    } else {
      this.offset = position.offset + 1;
      this.subOffset = undefined;
    }

    return token;
  }

  isGreedyAvailable(): boolean {
    // greedy 指的是将后续的文本都作为一个 token 处理，并且不允许后续有别的类型的消息段/token 了
    // 因此需要当前 offset 处在最后一个消息段，并且这个消息段必须是 text
    if (this.offset !== this.segments.length - 1) {
      return false;
    }

    const segment = this.segments[this.offset];
    if (segment?.type !== 'text') {
      return false;
    }

    return this.findTextTokenStart(segment.data.text, this.subOffset ?? 0) < segment.data.text.length;
  }

  greedy(): string {
    if (!this.isGreedyAvailable()) {
      throw new Error('Greedy token is not available');
    }

    const segment = this.segments[this.offset];
    if (segment.type !== 'text') {
      throw new Error('Greedy token is not available');
    }

    const tokenStart = this.findTextTokenStart(segment.data.text, this.subOffset ?? 0);
    const token = segment.data.text.slice(tokenStart);
    this.offset = this.segments.length;
    this.subOffset = undefined;

    return token;
  }

  private findNextPosition(): TokenizerState | undefined {
    let offset = this.offset;
    let subOffset = this.subOffset;

    while (offset < this.segments.length) {
      const segment = this.segments[offset];
      if (segment.type !== 'text') {
        return { offset, subOffset: undefined };
      }

      const tokenStart = this.findTextTokenStart(segment.data.text, subOffset ?? 0);
      if (tokenStart < segment.data.text.length) {
        return { offset, subOffset: tokenStart };
      }

      offset += 1;
      subOffset = undefined;
    }

    return undefined;
  }

  private findTextTokenStart(text: string, from: number): number {
    let offset = from;
    while (offset < text.length && text[offset] === ' ') {
      offset += 1;
    }

    return offset;
  }

  private readTextToken(text: string, from: number): string {
    let offset = from;
    while (offset < text.length && text[offset] !== ' ') {
      offset += 1;
    }

    return text.slice(from, offset);
  }
}
