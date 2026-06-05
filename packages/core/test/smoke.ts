import { createSimpleLogHandler } from '@fraqjs/mock';

import { Context, definePlugin, msg, param, seg } from '../src';

const ctx = Context.fromUrl('http://localhost:30001/', {
  logHandler: createSimpleLogHandler(),
});

const EchoPlugin = definePlugin({
  name: 'echo',
  apply(
    ctx,
    options: {
      trailingFaceId: number;
    },
  ) {
    ctx.router.command({
      name: 'echo',
      pattern: { command: param.greedy() },
      execute(session, { command }) {
        session.reply(msg`You said: ${command} ${seg.face(options.trailingFaceId)}`);
      },
    });
  },
});

ctx.install(EchoPlugin, {
  trailingFaceId: 42,
});

ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
