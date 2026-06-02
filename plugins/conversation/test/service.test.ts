import { Context, type milky, msg, param } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';

import { ConversationService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function text(text: string): milky.IncomingTextSegment {
  return {
    type: 'text',
    data: { text },
  };
}

function friendMessage(textContent: string, options: { peerId?: number; senderId?: number; seq?: number } = {}) {
  const peerId = options.peerId ?? 1;
  const senderId = options.senderId ?? peerId;
  const seq = options.seq ?? 1;

  return {
    event_type: 'message_receive',
    time: seq,
    self_id: 10000,
    data: {
      message_scene: 'friend',
      peer_id: peerId,
      message_seq: seq,
      sender_id: senderId,
      time: seq,
      segments: [text(textContent)],
      friend: {} as milky.FriendEntity,
    },
  } satisfies milky.MessageReceiveEvent;
}

async function tick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test('open resolves when a later message matches its temporary router', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  let resultPromise: Promise<'origin' | 'answer' | null> | undefined;
  let answerSeq: number | undefined;

  conversation.command('ask', {}, (_session, _params, { open }) => {
    resultPromise = open<'origin' | 'answer'>(
      ({ router, done }) => {
        router.command('ask', {}, () => {
          done('origin');
        });
        router.command('yes', {}, async (answerSession) => {
          answerSeq = answerSession.raw.message_seq;
          await answerSession.reply(msg`accepted`);
          done('answer');
        });
      },
      { timeout: 1000 },
    );
  });

  await ctx.start();
  await client.emitEvent(friendMessage('ask', { seq: 1 }));
  await tick();

  assert.ok(resultPromise);

  await client.emitEvent(friendMessage('yes', { seq: 2 }));

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

test('open tracks active conversations independently by sender, scene, and peer', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  const results = new Map<number, Promise<number | null>>();

  conversation.command('ask', {}, (session, _params, { open }) => {
    results.set(
      session.raw.sender_id,
      open<number>(
        ({ router, done }) => {
          router.command('yes', {}, (answerSession) => {
            done(answerSession.raw.sender_id);
          });
        },
        { timeout: 1000 },
      ),
    );
  });

  await ctx.start();
  await client.emitEvent(friendMessage('ask', { peerId: 1, senderId: 1, seq: 1 }));
  await client.emitEvent(friendMessage('ask', { peerId: 2, senderId: 2, seq: 1 }));
  await tick();

  await client.emitEvent(friendMessage('yes', { peerId: 2, senderId: 2, seq: 2 }));
  await client.emitEvent(friendMessage('yes', { peerId: 1, senderId: 1, seq: 2 }));

  assert.equal(await results.get(1), 1);
  assert.equal(await results.get(2), 2);
});

test('open resolves null when the conversation times out', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1 });
  let resultPromise: Promise<boolean | null> | undefined;

  conversation.command('ask', {}, (_session, _params, { open }) => {
    resultPromise = open<boolean>(({ router }) => {
      router.command('yes', {}, () => {});
    });
  });

  await ctx.start();
  await client.emitEvent(friendMessage('ask'));
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

  conversation.command('ask', {}, (_session, _params, { open }) => {
    resultPromise = open<boolean>(
      ({ router }) => {
        router.command('yes', {}, () => {});
      },
      { timeout: Number.POSITIVE_INFINITY },
    );
    resultPromise.catch(() => {});
  });

  await ctx.start();
  await client.emitEvent(friendMessage('ask'));
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

  conversation.command('天气', {}, async (session, _params, { open }) => {
    prompts += 1;
    await session.reply(msg`请输入城市`);
    resultPromise = open<string>(({ router, done }) => {
      router.rawPattern({ city: param.greedy() }, (_answerSession, { city }) => {
        done(city);
      });
    });
  });

  await ctx.start();
  await client.emitEvent(friendMessage('天气', { seq: 1 }));
  await tick();
  await client.emitEvent(friendMessage('天气', { seq: 2 }));

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
