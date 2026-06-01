import { Context, definePlugin, msg, param, seg, useMessage, setupUseMessage } from '../src';

const ctx = Context.create({
  connect: {
    baseUrl: 'http://localhost:3000/',
    accessToken: '11223344Tp,',
  },
});

setupUseMessage(ctx.router);

const EchoPlugin = definePlugin({
  name: 'echo',
  apply(
    ctx,
    options: {
      trailingFaceId: number;
    },
  ) {
    console.log('初始化完成');

    ctx.router.command('echo2', { command: param.greedy() }, async (session, { command }) => {
      session.reply(msg`You said: ${command} ${seg.face(options.trailingFaceId)}`);
    });

    ctx.router.command('echo', { command: param.greedy() }, async (session, { command }) => {
      const replySession = await useMessage(session);

      if (!replySession) {
        await session.reply(msg`You said: ${command} (but I can't reply to you)`);
        return;
      }

      session.reply(msg`You said: ${command} ${seg.face(options.trailingFaceId)}`);
    });
  },
});

ctx.install(EchoPlugin, {
  trailingFaceId: 42,
});

await ctx.start();
