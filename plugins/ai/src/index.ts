import { definePlugin } from '@fraqjs/fraq';
import type { LanguageModel } from 'ai';

import { type ProviderConfig, resolveLanguageModels } from './provider';
import { AiService } from './service';

export interface AiPluginOptions {
  providers: Record<string, ProviderConfig | Record<string, LanguageModel>>;
  defaultModel?: string;
}

function isProviderConfig(config: ProviderConfig | Record<string, LanguageModel>): config is ProviderConfig {
  return 'sdk' in config && 'options' in config && 'models' in config;
}

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
  async apply(ctx, options: AiPluginOptions) {
    const models: Record<string, LanguageModel> = {};
    for (const [name, config] of Object.entries(options.providers)) {
      if (isProviderConfig(config)) {
        const resolvedModels = await resolveLanguageModels(config);
        resolvedModels.forEach((model, idx) => {
          const modelName = `${name}/${config.models[idx]}`;
          models[modelName] = model;
        });
      } else {
        Object.entries(config).forEach(([modelName, model]) => {
          models[`${name}/${modelName}`] = model;
        });
      }
    }
    if (Object.keys(models).length === 0) {
      throw new Error('No language models resolved from the provided AI SDK configurations.');
    }
    ctx.provide(
      AiService,
      new AiService({
        models: models,
        defaultModel: options.defaultModel ?? Object.keys(models)[0],
      }),
    );
  },
});

export * from './service';

export default AiPlugin;
