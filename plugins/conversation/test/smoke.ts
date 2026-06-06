import { createSimpleLogHandler } from '@fraqjs/mock';

import { Context, definePlugin, msg, param } from '../../../packages/fraq/dist/index.mjs';
import { ConversationPlugin, ConversationService } from '../src';

const ctx = Context.fromUrl('http://localhost:30001/', {
  logHandler: createSimpleLogHandler(),
});

const WeatherPlugin = definePlugin({
  name: 'weather',
  inject: {
    conversation: ConversationService,
  },
  apply(ctx) {
    ctx.conversation.command({
      name: '天气',
      pattern: {},
      async execute(session, _params, { open }) {
        await session.reply(msg`你想查询哪个城市的天气呢？`);
        const city = await open<string>(({ router, done }) => {
          router.rawPattern({
            pattern: { city: param.str() },
            async execute(_, { city }) {
              done(city);
            },
          });
        });
        if (city === null) {
          return;
        }
        await session.reply(msg`没有找到${city}的天气信息呢...`); // just for mocking
      },
    });
  },
});

ctx.install(ConversationPlugin);
ctx.install(WeatherPlugin);
ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
