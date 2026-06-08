import type { Disposable } from '@fraqjs/fraq';
import type { Renderer, RenderOptions } from '@takumi-rs/core';
import type { ReactElementLike } from '@takumi-rs/helpers';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import type { ReactNode } from 'react';

export class TakumiService implements Disposable {
  private readonly abortController = new AbortController();

  constructor(readonly renderer: Renderer) {}

  async renderJsx(jsx: ReactNode | ReactElementLike, renderOptions?: RenderOptions) {
    const { node, stylesheets } = await fromJsx(jsx);
    return this.renderer.render(node, { stylesheets, ...renderOptions }, this.abortController.signal);
  }

  dispose() {
    this.abortController.abort();
  }
}
