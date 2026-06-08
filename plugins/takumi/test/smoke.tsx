import { createSimpleLogHandler } from '@fraqjs/mock';
import { astToJSX, parser } from 'markdown-to-jsx/react';

import { Context, definePlugin, msg, param, seg } from '../../../packages/fraq/dist/index.mjs';
import TakumiPlugin, { TakumiService } from '../src';

const ctx = Context.fromUrl('http://localhost:30001/', {
  logHandler: createSimpleLogHandler(),
});

ctx.install(TakumiPlugin);
ctx.install(
  definePlugin({
    name: 'takumi-smoke-test',
    inject: {
      takumi: TakumiService,
    },
    apply(ctx) {
      ctx.router.command({
        name: 'render',
        pattern: {
          content: param.greedy(),
        },
        async execute(session, { content }) {
          const ast = parser(content);
          const jsx = astToJSX(ast, {
            overrides: {
              code: {
                props: {
                  style: {
                    fontFamily: 'Roboto Mono, Noto Sans SC',
                  },
                },
              },
              pre: {
                props: {
                  style: {
                    fontFamily: 'Roboto Mono, Noto Sans SC',
                  },
                },
              },
            },
          });
          const img = await ctx.takumi.renderJsx(
            <div
              tw="px-5 bg-white"
              style={{
                fontFamily: 'Inter, Noto Sans SC',
              }}
            >
              {jsx}
            </div>,
            {
              width: 800,
              devicePixelRatio: 2.0,
            },
          );
          const base64 = `base64://${img.toString('base64')}`;
          await session.reply(msg`这是 Takumi 渲染的图片哦~${seg.image(base64)}`);
        },
      });
    },
  }),
);

ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
