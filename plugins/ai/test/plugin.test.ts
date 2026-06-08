import { Context } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';
import { generateText } from 'ai';

import AiPlugin, { AiService } from '../src';
import { mockLanguageModel } from './util/mock';

import assert from 'node:assert/strict';
import test from 'node:test';

test('AiPlugin provides AiService through the context', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  ctx.install(AiPlugin, {
    providers: {
      test: {
        model: mockLanguageModel('from plugin'),
      },
    },
  });
  await ctx.start();

  const result = await generateText({ model: ctx.resolve(AiService).model(), prompt: 'hi' });

  assert.equal(result.text, 'from plugin');

  await ctx.stop();
});

test('AiPlugin registers multiple provider aliases, default model, and all concrete models', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());
  const primary = mockLanguageModel('from primary');
  const mini = mockLanguageModel('from mini');
  const sonnet = mockLanguageModel('from sonnet');

  ctx.install(AiPlugin, {
    providers: {
      openai: {
        primary,
        mini,
      },
      anthropic: {
        sonnet,
      },
    },
    aliases: {
      default: 'openai/primary',
      fast: 'openai/mini',
      claude: 'anthropic/sonnet',
    },
    defaultModel: 'anthropic/sonnet',
  });
  await ctx.start();

  const service = ctx.resolve(AiService);

  assert.deepEqual(service.models(), ['openai/primary', 'openai/mini', 'anthropic/sonnet']);
  assert.equal(service.model(), sonnet);
  assert.equal(service.model('openai/primary'), primary);
  assert.equal(service.model('fast'), mini);
  assert.equal(service.model('claude'), sonnet);
  assert.equal(service.hasModel('default'), true);
  assert.equal(service.hasModel('anthropic/sonnet'), true);

  const result = await generateText({ model: service.model('fast'), prompt: 'hi' });
  assert.equal(result.text, 'from mini');

  await ctx.stop();
});
