import type { Context, Disposable } from '@fraqjs/fraq';
import {
  type ConstructRendererOptions,
  extractResourceUrls,
  type Font,
  Renderer,
  type RenderOptions,
} from '@takumi-rs/core';
import { fetchResources, type Node, type ReactElementLike } from '@takumi-rs/helpers';
import { type EmojiType, extractEmojis } from '@takumi-rs/helpers/emoji';
import { fromHtml } from '@takumi-rs/helpers/html';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import type { ReactNode } from 'react';

import fs from 'node:fs/promises';

function withMergedStylesheets(stylesheets: string[], renderOptions?: RenderOptions): RenderOptions {
  const extraStylesheets = renderOptions?.stylesheets ?? [];
  return {
    ...renderOptions,
    stylesheets: [...stylesheets, ...extraStylesheets],
  };
}

function combineAbortSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  return AbortSignal.any(signals.filter((signal): signal is AbortSignal => signal !== undefined));
}

export interface TakumiServiceOptions {
  renderer?: ConstructRendererOptions;
  onFontRegisterConflict?: 'error' | 'warn-and-ignore' | 'warn-and-replace';
}

export interface PathBasedFontDetails {
  name?: string;
  path: string;
  weight?: number;
  style?: 'normal' | 'italic' | 'oblique' | `oblique ${number}deg` | (string & {});
}

export class TakumiService implements Disposable {
  readonly renderer: Renderer;

  private readonly abortController = new AbortController();
  private readonly registeredFontFamilies = new Set<string>();

  private onFontRegisterConflict: 'error' | 'warn-and-ignore' | 'warn-and-replace';

  constructor(
    options?: TakumiServiceOptions,
    private readonly ctx?: Context,
  ) {
    this.renderer = new Renderer(options?.renderer);
    this.onFontRegisterConflict = options?.onFontRegisterConflict ?? 'warn-and-ignore';
  }

  async registerFontFamily(family: string, fonts: (string | PathBasedFontDetails | Font)[], signal?: AbortSignal) {
    if (this.registeredFontFamilies.has(family)) {
      const message = `Font family "${family}" has already been registered.`;
      if (this.onFontRegisterConflict === 'error') {
        throw new Error(message);
      } else if (this.onFontRegisterConflict === 'warn-and-ignore') {
        if (this.ctx) {
          this.ctx.logger.warn(`${message} Ignoring new registration.`);
        } else {
          console.warn(`${message} Ignoring new registration.`);
        }
        return;
      } else if (this.onFontRegisterConflict === 'warn-and-replace') {
        if (this.ctx) {
          this.ctx.logger.warn(`${message} Replacing previous registration.`);
        } else {
          console.warn(`${message} Replacing previous registration.`);
        }
        // Continue with registration
      }
    }

    await this.renderer.loadFonts(
      await Promise.all(
        fonts.map<Promise<Font>>(async (font) => {
          if (typeof font === 'string') {
            const data = await fs.readFile(font);
            return { name: family, data };
          } else if ('path' in font) {
            const { path, name = family, weight, style } = font;
            const data = await fs.readFile(path);
            return { name, data, weight, style };
          } else {
            return font;
          }
        }),
      ),
      combineAbortSignals(signal, this.abortController.signal),
    );

    this.registeredFontFamilies.add(family);
  }

  async renderJsx(
    jsx: ReactNode | ReactElementLike,
    renderOptions?: RenderOptions,
    signal?: AbortSignal,
  ): Promise<Buffer> {
    const { node, stylesheets } = await fromJsx(jsx);
    return this.renderer.render(
      node,
      withMergedStylesheets(stylesheets, renderOptions),
      combineAbortSignals(signal, this.abortController.signal),
    );
  }

  async renderJsxWithEmoji(
    jsx: ReactNode | ReactElementLike,
    renderOptions?: RenderOptions,
    signal?: AbortSignal,
    emojiType: EmojiType = 'noto',
  ): Promise<Buffer> {
    const { node, stylesheets } = await fromJsx(jsx);
    const { node: processedNode, fetchedResources } = await this.processEmoji(node, emojiType);
    return this.renderer.render(
      processedNode,
      withMergedStylesheets(stylesheets, {
        ...renderOptions,
        fetchedResources: [...fetchedResources, ...(renderOptions?.fetchedResources ?? [])],
      }),
      combineAbortSignals(signal, this.abortController.signal),
    );
  }

  async renderHtml(html: string, renderOptions?: RenderOptions, signal?: AbortSignal): Promise<Buffer> {
    const { node, stylesheets } = fromHtml(html);
    return this.renderer.render(
      node,
      withMergedStylesheets(stylesheets, renderOptions),
      combineAbortSignals(signal, this.abortController.signal),
    );
  }

  async renderHtmlWithEmoji(
    html: string,
    renderOptions?: RenderOptions,
    signal?: AbortSignal,
    emojiType: EmojiType = 'noto',
  ): Promise<Buffer> {
    const { node, stylesheets } = fromHtml(html);
    const { node: processedNode, fetchedResources } = await this.processEmoji(node, emojiType);
    return this.renderer.render(
      processedNode,
      withMergedStylesheets(stylesheets, {
        ...renderOptions,
        fetchedResources: [...fetchedResources, ...(renderOptions?.fetchedResources ?? [])],
      }),
      combineAbortSignals(signal, this.abortController.signal),
    );
  }

  private async processEmoji(node: Node, emojiType: EmojiType = 'twemoji') {
    const processedNode = extractEmojis(node, emojiType);
    const resourceUrls = extractResourceUrls(processedNode);
    const fetchedResources = await fetchResources(resourceUrls);
    return { node: processedNode, fetchedResources };
  }

  dispose() {
    this.abortController.abort();
  }
}
