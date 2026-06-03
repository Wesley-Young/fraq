import { createMockMilkyClient } from '@fraqjs/mock';

import { Context, type Disposable } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

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

test('event handlers can be unsubscribed', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  let receivedMessageEvents = 0;

  const off = ctx.on('message_receive', () => {
    receivedMessageEvents += 1;
  });

  await ctx.start();
  await client.receiveFriend({ userId: 1 }, []);
  off();
  await client.receiveFriend({ userId: 1 }, []);

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
  await client.receiveFriend({ userId: 1 }, []);

  assert.equal(client.startEventCalls, 1);
  assert.equal(receivedMessageEvents, 0);
});

test('stops child contexts before parent services and disposes services in reverse provision order', async () => {
  const calls: string[] = [];
  const parent = Context.fromClient(createMockMilkyClient());
  const child = parent.fork('child');

  parent.provide(ParentDisposableService, new ParentDisposableService(calls));
  child.provide(FirstDisposableService, new FirstDisposableService(calls));
  child.provide(SecondDisposableService, new SecondDisposableService(calls));
  child.provide(ChildDisposableService, new ChildDisposableService(calls));

  await parent.start();
  await parent.stop();

  assert.deepEqual(calls, ['child', 'second', 'first', 'parent']);
});
