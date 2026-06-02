import { Context, type milky, msg, type Session } from '@fraqjs/fraq';
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

function session(raw: milky.IncomingMessage): Session {
  return {
    raw,
    async reply() {},
  };
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

  ctx.router.command('ask', {}, (session) => {
    resultPromise = conversation.open<'origin' | 'answer'>(
      session,
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

test('open calls onUnmatched and keeps waiting for a matching message', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  const unmatchedSeqs: number[] = [];
  let resultPromise: Promise<boolean | null> | undefined;

  ctx.router.command('ask', {}, (session) => {
    resultPromise = conversation.open<boolean>(
      session,
      ({ router, done }) => {
        router.command('yes', {}, () => {
          done(true);
        });
      },
      {
        timeout: 1000,
        onUnmatched(raw) {
          unmatchedSeqs.push(raw.message_seq);
        },
      },
    );
  });

  await ctx.start();
  await client.emitEvent(friendMessage('ask', { seq: 1 }));
  await tick();

  assert.ok(resultPromise);

  await client.emitEvent(friendMessage('maybe', { seq: 2 }));
  await tick();
  await client.emitEvent(friendMessage('yes', { seq: 3 }));

  assert.deepEqual(unmatchedSeqs, [2]);
  assert.equal(await resultPromise, true);
});

test('open tracks active conversations independently by sender, scene, and peer', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const conversation = new ConversationService(ctx, { defaultTimeout: 1000 });
  const results = new Map<number, Promise<number | null>>();

  ctx.router.command('ask', {}, (session) => {
    results.set(
      session.raw.sender_id,
      conversation.open<number>(
        session,
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
  const ctx = Context.fromClient(createMockMilkyClient());
  const conversation = new ConversationService(ctx, { defaultTimeout: 1 });
  const result = await conversation.open(session(friendMessage('ask').data), ({ router }) => {
    router.command('yes', {}, () => {});
  });

  assert.equal(result, null);
});

test('requires defaultTimeout and timeout to be positive finite numbers', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  assert.throws(() => new ConversationService(ctx, { defaultTimeout: 0 }), /defaultTimeout/);

  const conversation = new ConversationService(ctx);
  await assert.rejects(
    () =>
      conversation.open(
        session(friendMessage('ask').data),
        ({ router }) => {
          router.command('yes', {}, () => {});
        },
        { timeout: Number.POSITIVE_INFINITY },
      ),
    /timeout/,
  );
});
