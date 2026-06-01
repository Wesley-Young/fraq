import { Context, type EventMap, filter, type milky } from '../src';
import { createMockMilkyClient } from './util/mock';

import assert from 'node:assert/strict';
import test from 'node:test';

function createTestContext(): Context {
  return Context.fromClient(createMockMilkyClient());
}

type TestEventBus = {
  emit<K extends keyof EventMap>(type: K, event: EventMap[K]): void;
};

function emitEvent<K extends keyof EventMap>(ctx: Context, type: K, event: EventMap[K]): void {
  (ctx as unknown as { eventBus: TestEventBus }).eventBus.emit(type, event);
}

test('fork filters reject events without an explicit predicate', () => {
  const parent = createTestContext();
  const child = parent.fork(
    'child',
    filter.define({
      message_receive: () => true,
    }),
  );
  let receivedRecallEvents = 0;

  child.on('message_recall', () => {
    receivedRecallEvents += 1;
  });

  emitEvent(parent, 'message_recall', {
    event_type: 'message_recall',
    time: 1,
    self_id: 1,
    data: {
      message_scene: 'friend',
      peer_id: 1,
      message_seq: 1,
      sender_id: 1,
      operator_id: 1,
      display_suffix: '',
    },
  });

  assert.equal(receivedRecallEvents, 0);
});

test('fork filters pass events when the predicate accepts them', () => {
  const parent = createTestContext();
  const child = parent.fork(
    'child',
    filter.define({
      message_receive: () => true,
    }),
  );
  let receivedMessageEvents = 0;

  child.on('message_receive', () => {
    receivedMessageEvents += 1;
  });

  emitEvent(parent, 'message_receive', {
    event_type: 'message_receive',
    time: 1,
    self_id: 1,
    data: {
      message_scene: 'friend',
      peer_id: 1,
      message_seq: 1,
      sender_id: 1,
      time: 1,
      segments: [],
      // @ts-expect-error
      friend: {},
    },
  });

  assert.equal(receivedMessageEvents, 1);
});

test('creates contexts from client instances and starts event streams on the root context', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  let receivedMessageEvents = 0;

  ctx.on('message_receive', () => {
    receivedMessageEvents += 1;
  });

  await ctx.start();
  await client.emitEvent({
    event_type: 'message_receive',
    time: 1,
    self_id: 1,
    // @ts-expect-error
    data: {
      message_scene: 'friend',
      peer_id: 1,
      message_seq: 1,
      sender_id: 1,
      time: 1,
      segments: [],
      friend: {},
    },
  });

  assert.equal(ctx.client, client);
  assert.equal(client.startEventCalls, 1);
  assert.equal(receivedMessageEvents, 1);
});

test('forked contexts share the parent client and receive filtered root events', async () => {
  const client = createMockMilkyClient();
  const parent = Context.fromClient(client);
  const child = parent.fork(
    'child',
    filter.define({
      message_receive: () => true,
    }),
  );
  let childMessageEvents = 0;

  child.on('message_receive', () => {
    childMessageEvents += 1;
  });

  await parent.start();
  await client.emitEvent({
    event_type: 'message_receive',
    time: 1,
    self_id: 1,
    // @ts-expect-error
    data: {
      message_scene: 'friend',
      peer_id: 1,
      message_seq: 1,
      sender_id: 1,
      time: 1,
      segments: [],
      friend: {},
    },
  });

  assert.equal(child.client, client);
  assert.equal(client.startEventCalls, 1);
  assert.equal(childMessageEvents, 1);
});

test('session replies through the client API', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const replyMessage: milky.OutgoingSegment_ZodInput[] = [
    {
      type: 'text',
      data: {
        text: 'pong',
      },
    },
  ];

  ctx.router.command('ping', {}, (session) => {
    return session.reply(replyMessage);
  });

  await ctx.start();
  await client.emitEvent({
    event_type: 'message_receive',
    time: 1,
    self_id: 1,
    // @ts-expect-error
    data: {
      message_scene: 'group',
      peer_id: 123,
      message_seq: 1,
      sender_id: 456,
      time: 1,
      segments: [
        {
          type: 'text',
          data: {
            text: 'ping',
          },
        },
      ],
      group: {},
      group_member: {},
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(client.apiCalls, [
    {
      endpoint: 'send_group_message',
      params: {
        group_id: 123,
        message: replyMessage,
      },
    },
  ]);
});

test('retries the event stream after startup failures', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client, {
    reconnect: {
      initialDelayMs: 0,
      maxDelayMs: 0,
    },
  });
  client.failNextStart(new Error('boom'));

  await ctx.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(client.startEventCalls, 2);
});

test('creates contexts from URLs with the default client', () => {
  const ctx = Context.fromUrl(new URL('http://localhost:30001/'), {
    accessToken: 'token',
  });

  assert.equal((ctx.client as unknown as { baseUrl: string }).baseUrl, 'http://localhost:30001');
});
