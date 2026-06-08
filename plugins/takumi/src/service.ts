import type { Disposable } from '@fraqjs/fraq';
import type { Renderer, RenderOptions } from '@takumi-rs/core';
import type { ReactElementLike } from '@takumi-rs/helpers';
import { fromHtml } from '@takumi-rs/helpers/html';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import type { ReactNode } from 'react';

function withMergedStylesheets(stylesheets: string[], renderOptions?: RenderOptions): RenderOptions {
  const extraStylesheets = renderOptions?.stylesheets ?? [];
  return {
    ...renderOptions,
    stylesheets: [...stylesheets, ...extraStylesheets],
  };
}

export class TakumiService implements Disposable {
  private readonly abortController = new AbortController();

  constructor(readonly renderer: Renderer) {}

  async renderJsx(jsx: ReactNode | ReactElementLike, renderOptions?: RenderOptions): Promise<Buffer> {
    const { node, stylesheets } = await fromJsx(jsx);
    return this.renderer.render(node, withMergedStylesheets(stylesheets, renderOptions), this.abortController.signal);
  }

  async renderHtml(html: string, renderOptions?: RenderOptions): Promise<Buffer> {
    const { node, stylesheets } = fromHtml(html);
    return this.renderer.render(node, withMergedStylesheets(stylesheets, renderOptions), this.abortController.signal);
  }

  dispose() {
    this.abortController.abort();
  }
}
