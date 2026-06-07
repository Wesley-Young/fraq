import { Context, definePlugin } from '@fraqjs/fraq';
import { createSimpleLogHandler } from '@fraqjs/mock';
import { generateText, simulateReadableStream, streamText } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';

import AiPlugin, { AiService } from '../src';

const ctx = Context.fromUrl('http://localhost:30001', {
  logHandler: createSimpleLogHandler(),
});

ctx.install(AiPlugin, {
  providers: {
    test: {
      model: new MockLanguageModelV3({
        async doGenerate() {
          return {
            content: [{ type: 'text', text: 'Hello from the mock model!' }],
            finishReason: { unified: 'stop', raw: undefined },
            usage: {
              inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 5, text: 5, reasoning: undefined },
            },
            warnings: [],
          };
        },
        async doStream() {
          return {
            stream: simulateReadableStream({
              chunks: [
                { type: 'text-start', id: '1' },
                { type: 'text-delta', id: '1', delta: 'Hello ' },
                { type: 'text-delta', id: '1', delta: 'stream!' },
                { type: 'text-end', id: '1' },
                {
                  type: 'finish',
                  finishReason: { unified: 'stop', raw: undefined },
                  usage: {
                    inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
                    outputTokens: { total: 2, text: 2, reasoning: undefined },
                  },
                },
              ],
            }),
          };
        },
      }),
    },
  },
});

ctx.install(
  definePlugin({
    name: 'ai-smoke-test',
    inject: {
      ai: AiService,
    },
    apply() {},
    async start(ctx) {
      const { text } = await generateText({ model: ctx.ai.model(), prompt: 'Say hello.' });
      console.log('generateText:', text);

      const stream = streamText({ model: ctx.ai.model(), prompt: 'Stream hello.' });
      let streamed = '';
      for await (const delta of stream.textStream) {
        streamed += delta;
      }
      console.log('streamText:', streamed);
    },
  }),
);

ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
