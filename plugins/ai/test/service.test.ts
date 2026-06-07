import { generateText, jsonSchema, streamText, tool } from 'ai';

import { AiService } from '../src';
import { mockLanguageModel, mockToolCallModel } from './util/mock';

import assert from 'node:assert/strict';
import test from 'node:test';

test('AiService exposes the configured model', () => {
  const model = mockLanguageModel('hello');
  const service = new AiService({
    models: {
      'test/model': model,
    },
    aliases: {},
    defaultModel: 'test/model',
  });

  assert.equal(service.model(), model);
});

test('AiService resolves models by name and alias', () => {
  const primary = mockLanguageModel('primary');
  const fallback = mockLanguageModel('fallback');
  const service = new AiService({
    models: {
      'openai/gpt-4o': primary,
      'anthropic/claude-sonnet': fallback,
    },
    aliases: {
      openai: 'openai/gpt-4o',
      claude: 'anthropic/claude-sonnet',
    },
    defaultModel: 'anthropic/claude-sonnet',
  });

  assert.equal(service.model(), fallback);
  assert.equal(service.model('openai/gpt-4o'), primary);
  assert.equal(service.model('openai'), primary);
  assert.equal(service.model('claude'), fallback);
  assert.equal(service.hasModel('openai/gpt-4o'), true);
  assert.equal(service.hasModel('openai'), true);
  assert.equal(service.hasModel('missing'), false);
});

test('AiService exposes a defensive copy of all concrete models', () => {
  const first = mockLanguageModel('first');
  const second = mockLanguageModel('second');
  const service = new AiService({
    models: {
      'test/first': first,
      'test/second': second,
    },
    aliases: {
      first: 'test/first',
    },
    defaultModel: 'test/first',
  });

  const models = service.models();

  assert.deepEqual(Object.keys(models), ['test/first', 'test/second']);
  assert.equal(models['test/first'], first);
  assert.equal(models['test/second'], second);

  delete models['test/first'];

  assert.equal(service.model('test/first'), first);
  assert.equal(service.model('first'), first);
});

test('AiService throws for unknown model names', () => {
  const service = new AiService({
    models: {
      'test/model': mockLanguageModel('hello'),
    },
    aliases: {},
    defaultModel: 'test/model',
  });

  assert.throws(() => service.model('missing'), /Model not found: missing/);
});

test('AiService constructor rejects aliases that point to missing models', () => {
  assert.throws(
    () =>
      new AiService({
        models: {
          'test/model': mockLanguageModel('hello'),
        },
        aliases: {
          missing: 'test/missing',
        },
        defaultModel: 'test/model',
      }),
    /Invalid alias "missing": target model "test\/missing" does not exist/,
  );
});

test('AiService constructor rejects a missing default model', () => {
  assert.throws(
    () =>
      new AiService({
        models: {
          'test/model': mockLanguageModel('hello'),
        },
        aliases: {},
        defaultModel: 'test/missing',
      }),
    /Invalid default model "test\/missing": model does not exist/,
  );
});

test('the exposed model works with the raw generateText function', async () => {
  const service = new AiService({
    models: {
      'test/model': mockLanguageModel('hello from the model'),
    },
    aliases: {},
    defaultModel: 'test/model',
  });

  const result = await generateText({ model: service.model(), prompt: 'hi' });

  assert.equal(result.text, 'hello from the model');
});

test('the exposed model works with the raw streamText function', async () => {
  const service = new AiService({
    models: {
      'test/model': mockLanguageModel('streamed text'),
    },
    aliases: {},
    defaultModel: 'test/model',
  });

  const result = streamText({ model: service.model(), prompt: 'hi' });

  let collected = '';
  for await (const part of result.textStream) {
    collected += part;
  }

  assert.equal(collected, 'streamed text');
});

test('the exposed model supports tool calling with full type inference', async () => {
  const service = new AiService({
    models: {
      'test/model': mockToolCallModel('weather', { city: 'Tokyo' }),
    },
    aliases: {},
    defaultModel: 'test/model',
  });

  const result = await generateText({
    model: service.model(),
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
