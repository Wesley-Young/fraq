import { definePlugin } from '@fraqjs/fraq';
import { type ConstructRendererOptions, Renderer } from '@takumi-rs/core';

import { TakumiService } from './service';

export interface TakumiPluginOptions {
  renderer?: ConstructRendererOptions;
}

export const TakumiPlugin = definePlugin({
  name: 'takumi',
  provides: [TakumiService],
  apply(ctx, options?: TakumiPluginOptions) {
    const renderer = new Renderer(options?.renderer);
    ctx.provide(TakumiService, new TakumiService(renderer));
  },
});

export * from './service';

export default TakumiPlugin;
