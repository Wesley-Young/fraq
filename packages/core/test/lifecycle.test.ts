import { createMockMilkyClient } from '@fraqjs/mock';

import { Context, type Disposable, type EventMap } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

type TestEventBus = {
  emit<K extends keyof EventMap>(type: K, event: EventMap[K]): void;
};

class ParentDisposableService implements Disposable {
  constructor(private readonly calls: string[]) {}

  dispose(): void {
    this.calls.push('parent');
  }
}

class FirstDisposableService implements Disposable {
  constructor(private readonly calls: string[]) {}

  dispose(): void {
    this.calls.push('first');
  }
}

class SecondDisposableService implements Disposable {
  constructor(private readonly calls: string[]) {}

  dispose(): void {
    this.calls.push('second');
  }
}

class ChildDisposableService implements Disposable {
  constructor(private readonly calls: string[]) {}

  dispose(): void {
    this.calls.push('child');
  }
}

function createTestContext(): Context {
  return Context.fromClient(createMockMilkyClient());
}

function createMessageEvent(messageSeq: number): EventMap['message_receive'] {
  return {
    event_type: 'message_receive',
    time: messageSeq,
    self_id: 1,
    data: {
      message_scene: 'friend',
      peer_id: 1,
      message_seq: messageSeq,
      sender_id: 1,
      time: messageSeq,
      segments: [],
      // @ts-expect-error
      friend: {},
    },
  };
}

function emitEvent<K extends keyof EventMap>(ctx: Context, type: K, event: EventMap[K]): void {
  (ctx as unknown as { eventBus: TestEventBus }).eventBus.emit(type, event);
}

test('event handlers can be unsubscribed', () => {
  const ctx = createTestContext();
  let receivedMessageEvents = 0;

  const off = ctx.on('message_receive', () => {
    receivedMessageEvents += 1;
  });

  emitEvent(ctx, 'message_receive', createMessageEvent(1));
  off();
  emitEvent(ctx, 'message_receive', createMessageEvent(2));

  assert.equal(receivedMessageEvents, 1);
});

test('stops the root event stream and ignores later stream events', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  let receivedMessageEvents = 0;

  ctx.on('message_receive', () => {
    receivedMessageEvents += 1;
  });

  await ctx.start();
  await ctx.stop();
  await client.emitEvent(createMessageEvent(1));

  assert.equal(client.startEventCalls, 1);
  assert.equal(receivedMessageEvents, 0);
});

test('stops child contexts before parent services and disposes services in reverse provision order', async () => {
  const calls: string[] = [];
  const parent = createTestContext();
  const child = parent.fork('child');

  parent.provide(ParentDisposableService, new ParentDisposableService(calls));
  child.provide(FirstDisposableService, new FirstDisposableService(calls));
  child.provide(SecondDisposableService, new SecondDisposableService(calls));
  child.provide(ChildDisposableService, new ChildDisposableService(calls));

  await parent.start();
  await parent.stop();

  assert.deepEqual(calls, ['child', 'second', 'first', 'parent']);
});
