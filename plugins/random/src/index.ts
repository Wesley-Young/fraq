import { definePlugin } from '@fraqjs/fraq';

import { RandomService, type RandomServiceOptions } from './service';

export const RandomPlugin = definePlugin({
  name: 'random',
  provides: [RandomService],
  apply(ctx, options?: RandomServiceOptions) {
    ctx.provide(RandomService, new RandomService(options));
  },
});

export * from './service';
