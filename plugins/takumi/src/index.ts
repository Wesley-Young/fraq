import { definePlugin } from '@fraqjs/fraq';

import { TakumiService, type TakumiServiceOptions } from './service';

import { createRequire } from 'node:module';

export interface TakumiPluginOptions extends TakumiServiceOptions {
  loadBuiltinFonts?: boolean;
}

export const TakumiPlugin = definePlugin({
  name: 'takumi',
  provides: [TakumiService],
  async apply(ctx, options?: TakumiPluginOptions) {
    const service = new TakumiService(ctx, options ?? {});
    if (options?.loadBuiltinFonts ?? true) {
      ctx.logger.debug('Loading built-in fonts...');
      const require = createRequire(import.meta.url);
      await service.registerFontFamily('Noto Sans SC', [require.resolve('../fonts/NotoSansSC-VariableFont_wght.ttf')]);
    }
    ctx.provide(TakumiService, service);
  },
});

export * from './service';

export default TakumiPlugin;
