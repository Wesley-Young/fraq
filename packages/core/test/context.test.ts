import { createMockMilkyClient, inmsg } from '@fraqjs/mock';

import { Context, filter, type LogMessage, type milky } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function snapshotLog(message: LogMessage): Omit<LogMessage, 'time'> {
  const { time: _time, ...rest } = message;
  return rest;
}

test('fork filters reject events without an explicit predicate', async () => {
  const client = createMockMilkyClient();
  const parent = Context.fromClient(client);
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

  await parent.start();
  await client.emitEvent({
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

test('fork filters pass events when the predicate accepts them', async () => {
  const client = createMockMilkyClient();
  const parent = Context.fromClient(client);
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

  await parent.start();
  await client.receiveFriend({ userId: 1 }, []);

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
  await client.receiveFriend({ userId: 1 }, []);

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
  await client.receiveFriend({ userId: 1 }, []);

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
  await client.receiveGroup({ groupId: 123, userId: 456 }, inmsg`ping`);
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
  const logs: LogMessage[] = [];
  const startError = new Error('boom');
  const ctx = Context.fromClient(client, {
    reconnect: {
      initialDelayMs: 0,
      maxDelayMs: 0,
    },
    logHandler(message) {
      logs.push(message);
    },
  });
  client.failNextStart(startError);

  await ctx.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(client.startEventCalls, 2);
  assert.deepEqual(logs.map(snapshotLog), [
    {
      level: 'debug',
      module: 'root',
      message: 'Connecting event stream (attempt=1)',
      error: undefined,
    },
    {
      level: 'error',
      module: 'root',
      message: 'Error connecting event stream; reconnecting in 0ms',
      error: startError,
    },
    {
      level: 'debug',
      module: 'root',
      message: 'Connecting event stream (attempt=2)',
      error: undefined,
    },
    {
      level: 'info',
      module: 'root',
      message: 'Event stream connected',
      error: undefined,
    },
  ]);
});

test('creates contexts from URLs with the default client', () => {
  const ctx = Context.fromUrl(new URL('http://localhost:30001/'), {
    accessToken: 'token',
  });

  assert.equal((ctx.client as unknown as { baseUrl: string }).baseUrl, 'http://localhost:30001');
});
