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
      await service.registerFontFamily('Inter', [
        require.resolve('../fonts/Inter-VariableFont_opsz,wght.ttf'),
        require.resolve('../fonts/Inter-Italic-VariableFont_opsz,wght.ttf'),
      ]);
      await service.registerFontFamily('Roboto Mono', [
        require.resolve('../fonts/RobotoMono-VariableFont_wght.ttf'),
        require.resolve('../fonts/RobotoMono-Italic-VariableFont_wght.ttf'),
      ]);
      await service.registerFontFamily('Noto Sans SC', [require.resolve('../fonts/NotoSansSC-VariableFont_wght.ttf')]);
    }
    ctx.provide(TakumiService, service);
  },
});

export * from './service';

export default TakumiPlugin;
