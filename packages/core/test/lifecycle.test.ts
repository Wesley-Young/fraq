import { createMockMilkyClient } from '@fraqjs/mock';

import { Context, type Disposable, definePlugin } from '../src';

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

test('applies the context tree before starting plugins from parents to children', async () => {
  const calls: string[] = [];
  const parent = Context.fromClient(createMockMilkyClient());
  const child = parent.fork('child');

  parent.install(
    definePlugin({
      name: 'parent',
      apply() {
        calls.push('parent apply');
      },
      start() {
        calls.push('parent start');
      },
    }),
  );
  child.install(
    definePlugin({
      name: 'child',
      apply() {
        calls.push('child apply');
      },
      start() {
        calls.push('child start');
      },
    }),
  );

  await parent.start();

  assert.deepEqual(calls, ['parent apply', 'child apply', 'parent start', 'child start']);
});

test('recovers the parent context state when a child context fails to start', async () => {
  const client = createMockMilkyClient();
  const parent = Context.fromClient(client);
  const child = parent.fork('child');
  let applyCalls = 0;
  let shouldThrow = true;

  child.install(
    definePlugin({
      name: 'flaky-child',
      apply() {
        applyCalls += 1;
        if (shouldThrow) {
          shouldThrow = false;
          throw new Error('boom');
        }
      },
    }),
  );

  await assert.rejects(() => parent.start(), /boom/);
  await child.start();
  assert.equal(applyCalls, 2);

  await parent.start();

  assert.equal(client.startEventCalls, 1);
});
