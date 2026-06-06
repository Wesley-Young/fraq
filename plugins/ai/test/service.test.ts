import { Context } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';
import { generateText, jsonSchema, simulateReadableStream, streamText, tool } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';

import AiPlugin, { AiService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function mockLanguageModel(text: string, modelId = 'mock-language-model'): MockLanguageModelV3 {
  return new MockLanguageModelV3({
    modelId,
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: text },
          { type: 'text-end', id: 'text-1' },
          {
            type: 'finish',
            finishReason: { unified: 'stop', raw: undefined },
            usage: {
              inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 1, text: 1, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

function mockToolCallModel(toolName: string, input: unknown): MockLanguageModelV3 {
  return new MockLanguageModelV3({
    modelId: 'mock-tool-model',
    doGenerate: async () => ({
      content: [{ type: 'tool-call', toolCallId: 'call-1', toolName, input: JSON.stringify(input) }],
      finishReason: { unified: 'tool-calls', raw: undefined },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
  });
}

test('AiService exposes the configured model', () => {
  const model = mockLanguageModel('hello');
  const service = new AiService({ model });

  assert.equal(service.model, model);
});

test('the exposed model works with the raw generateText function', async () => {
  const service = new AiService({ model: mockLanguageModel('hello from the model') });

  const result = await generateText({ model: service.model, prompt: 'hi' });

  assert.equal(result.text, 'hello from the model');
});

test('the exposed model works with the raw streamText function', async () => {
  const service = new AiService({ model: mockLanguageModel('streamed text') });

  const result = streamText({ model: service.model, prompt: 'hi' });

  let collected = '';
  for await (const part of result.textStream) {
    collected += part;
  }

  assert.equal(collected, 'streamed text');
});

test('the exposed model supports tool calling with full type inference', async () => {
  const service = new AiService({ model: mockToolCallModel('weather', { city: 'Tokyo' }) });

  const result = await generateText({
    model: service.model,
    prompt: 'What is the weather in Tokyo?',
    tools: {
      weather: tool({
        description: 'Get the weather for a city',
        inputSchema: jsonSchema<{ city: string }>({
          type: 'object',
          properties: { city: { type: 'string' } },
          required: ['city'],
          additionalProperties: false,
        }),
        execute: async ({ city }) => `sunny in ${city}`,
      }),
    },
  });

  assert.equal(result.toolCalls[0]?.toolName, 'weather');
  assert.deepEqual(result.toolCalls[0]?.input, { city: 'Tokyo' });
  assert.equal(result.toolResults[0]?.output, 'sunny in Tokyo');
});

test('AiPlugin provides AiService through the context', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  ctx.install(AiPlugin, { model: mockLanguageModel('from plugin') });
  await ctx.start();

  const result = await generateText({ model: ctx.resolve(AiService).model, prompt: 'hi' });

  assert.equal(result.text, 'from plugin');

  await ctx.stop();
});
