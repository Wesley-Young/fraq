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
    ctx.router.command('echo', { command: param.greedy() }, (session, { command }) => {
      session.reply(msg`You said: ${command} ${seg.face(options.trailingFaceId)}`);
    });
  },
});

ctx.install(EchoPlugin, {
  trailingFaceId: 42,
});

await ctx.start();
