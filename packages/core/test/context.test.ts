import { Context, type EventMap, filter } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function createTestContext(): Context {
  return Context.create({
    connect: {
      baseUrl: 'http://localhost:30001/',
    },
  });
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
      friend: {},
    },
  });

  assert.equal(receivedMessageEvents, 1);
});
