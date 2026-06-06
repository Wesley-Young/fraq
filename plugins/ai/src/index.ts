import { definePlugin } from '@fraqjs/fraq';

import { AiService, type AiServiceOptions } from './service';

export type AiPluginOptions = AiServiceOptions;

/**
 * A thin Fraq plugin around the Vercel AI SDK.
 *
 * It provides an {@link AiService} that exposes a configured language model via
 * `ctx.ai.model`, so other plugins can inject it and pass the model directly to
 * the AI SDK Core functions imported from `ai`.
 */
export const AiPlugin = definePlugin({
  name: 'ai',
  provides: [AiService],
  apply(ctx, options: AiPluginOptions) {
    ctx.provide(AiService, new AiService(options));
  },
});

export * from './service';

export default AiPlugin;
