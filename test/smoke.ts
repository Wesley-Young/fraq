import { Context, definePlugin, msg, param, seg } from '../src';

const ctx = Context.create({
  connect: {
    baseUrl: 'http://localhost:30001/',
  },
});

const EchoPlugin = definePlugin({
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
