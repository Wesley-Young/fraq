import { Context, msg, param } from '@fraqjs/fraq';
import { createMockMilkyClient, inmsg } from '@fraqjs/mock';

import { ConversationService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

async function tick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test('open resolves when a later message matches its temporary router', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  let resultPromise: Promise<'origin' | 'answer' | null> | undefined;
  let answerSeq: number | undefined;

  conversation.command('ask').execute((_session, _params, { open }) => {
    resultPromise = open<'origin' | 'answer'>(
      ({ router, done }) => {
        router.command('ask').execute(() => {
          done('origin');
        });
        router.command('yes').execute(async (answerSession) => {
          answerSeq = answerSession.raw.message_seq;
          await answerSession.reply(msg`accepted`);
          done('answer');
        });
      },
      { timeout: 1000 },
    );
  });
  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`ask`);
  await tick();

  assert.ok(resultPromise);

  await client.receiveFriend({ userId: 1 }, inmsg`yes`);

  assert.equal(await resultPromise, 'answer');
  assert.equal(answerSeq, 2);
  assert.deepEqual(client.apiCalls, [
    {
      endpoint: 'send_private_message',
      params: {
        user_id: 1,
        message: msg`accepted`,
      },
    },
  ]);
});

test('command builder captures command parameters', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  let captured: string | undefined;

  conversation
    .command('ask')
    .arg('topic', param.str())
    .execute((_session, { topic }) => {
      captured = topic;
    });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`ask weather`);
  await tick();

  assert.equal(captured, 'weather');
});

test('open tracks active conversations independently by sender, scene, and peer', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  const results = new Map<number, Promise<number | null>>();

  conversation.command({
    name: 'ask',
    pattern: {},
    execute(session, _params, { open }) {
      results.set(
        session.raw.sender_id,
        open<number>(
          ({ router, done }) => {
            router.command({
              name: 'yes',
              pattern: {},
              execute(answerSession) {
                done(answerSession.raw.sender_id);
              },
            });
          },
          { timeout: 1000 },
        ),
      );
    },
  });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`ask`);
  await client.receiveFriend({ userId: 2 }, inmsg`ask`);
  await tick();

  await client.receiveFriend({ userId: 2 }, inmsg`yes`);
  await client.receiveFriend({ userId: 1 }, inmsg`yes`);

  assert.equal(await results.get(1), 1);
  assert.equal(await results.get(2), 2);
});

test('open resolves null when the conversation times out', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1 });
  let resultPromise: Promise<boolean | null> | undefined;

  conversation.command({
    name: 'ask',
    pattern: {},
    execute(_session, _params, { open }) {
      resultPromise = open<boolean>(({ router }) => {
        router.command({ name: 'yes', pattern: {}, execute() {} });
      });
    },
  });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`ask`);
  await tick();

  assert.ok(resultPromise);
  const result = await resultPromise;

  assert.equal(result, null);
});

test('requires defaultTimeout and timeout to be positive finite numbers', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);

  assert.throws(() => new ConversationService(ctx, { defaultTimeout: 0 }), /defaultTimeout/);

  const conversation = new ConversationService(ctx);
  let resultPromise: Promise<boolean | null> | undefined;

  conversation.command({
    name: 'ask',
    pattern: {},
    execute(_session, _params, { open }) {
      resultPromise = open<boolean>(
        ({ router }) => {
          router.command({ name: 'yes', pattern: {}, execute() {} });
        },
        { timeout: Number.POSITIVE_INFINITY },
      );
      resultPromise.catch(() => {});
    },
  });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`ask`);
  await tick();

  assert.ok(resultPromise);
  await assert.rejects(resultPromise, /timeout/);
});

test('active conversation handles a repeated triggering command without dispatching the command again', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  let prompts = 0;
  let resultPromise: Promise<string | null> | undefined;

  conversation.command({
    name: '天气',
    pattern: {},
    async execute(session, _params, { open }) {
      prompts += 1;
      await session.reply(msg`请输入城市`);
      resultPromise = open<string>(({ router, done }) => {
        router
          .rawPattern()
          .arg('city', param.greedy())
          .execute((_answerSession, { city }) => {
            done(city);
          });
      });
    },
  });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, inmsg`天气`);
  await tick();
  await client.receiveFriend({ userId: 1 }, inmsg`天气`);

  assert.ok(resultPromise);
  assert.equal(await resultPromise, '天气');
  assert.equal(prompts, 1);
  assert.deepEqual(client.apiCalls, [
    {
      endpoint: 'send_private_message',
      params: {
        user_id: 1,
        message: msg`请输入城市`,
      },
    },
  ]);
});
