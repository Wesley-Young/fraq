import { createMockMilkyClient } from '@fraqjs/mock';

import {
  Context,
  type Disposable,
  definePlugin,
  type LogMessage,
  type MilkyClient,
  type MilkyEventSubscription,
} from '../src';

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

function snapshotLog(message: LogMessage): Omit<LogMessage, 'time'> {
  const { time: _time, ...rest } = message;
  return rest;
}

async function flushTimers(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function createSlowStoppingClient(): {
  client: MilkyClient;
  stopStarted: Promise<void>;
  resolveStopped: () => void;
} {
  const client = createMockMilkyClient();
  let resolveStopStarted!: () => void;
  let resolveStopped!: () => void;
  const stopStarted = new Promise<void>((resolve) => {
    resolveStopStarted = resolve;
  });
  const stopped = new Promise<void>((resolve) => {
    resolveStopped = resolve;
  });

  client.startEvents = async (): Promise<MilkyEventSubscription> => ({
    closed: stopped,
    async stop() {
      resolveStopStarted();
      await stopped;
    },
  });

  return { client, stopStarted, resolveStopped };
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

test('clears context timers when the context stops', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());
  let timeoutCalls = 0;
  let intervalCalls = 0;

  ctx.timeout(0, () => {
    timeoutCalls += 1;
  });
  ctx.interval(0, () => {
    intervalCalls += 1;
  });

  await ctx.stop();
  await flushTimers();

  assert.equal(timeoutCalls, 0);
  assert.equal(intervalCalls, 0);
});

test('rejects timers scheduled after the context has stopped', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  await ctx.start();
  await ctx.stop();

  assert.throws(() => ctx.timeout(0, () => {}), /cannot schedule timers after it has stopped/);
  assert.throws(() => ctx.interval(0, () => {}), /cannot schedule timers after it has stopped/);
});

test('rejects timers scheduled while the context is stopping', async () => {
  const { client, stopStarted, resolveStopped } = createSlowStoppingClient();
  const ctx = Context.fromClient(client);

  await ctx.start();
  const stopPromise = ctx.stop();
  await stopStarted;

  assert.throws(() => ctx.timeout(0, () => {}), /cannot schedule timers while it is stopping/);
  assert.throws(() => ctx.interval(0, () => {}), /cannot schedule timers while it is stopping/);

  resolveStopped();
  await stopPromise;
});

test('ignores queued timer callbacks once the context is stopping', async () => {
  const { client, stopStarted, resolveStopped } = createSlowStoppingClient();
  const ctx = Context.fromClient(client);
  let calls = 0;
  let stopPromise: Promise<void> | undefined;

  await ctx.start();
  ctx.timeout(0, () => {
    stopPromise = ctx.stop();
  });
  ctx.timeout(0, () => {
    calls += 1;
  });
  await stopStarted;
  await flushTimers();
  resolveStopped();
  await stopPromise;

  assert.equal(calls, 0);
});

test('stops child context timers before waiting for the parent event stream to stop', async () => {
  const { client, stopStarted, resolveStopped } = createSlowStoppingClient();
  const parent = Context.fromClient(client);
  const child = parent.fork('child');
  let calls = 0;

  child.interval(0, () => {
    calls += 1;
  });

  await parent.start();
  const stopPromise = parent.stop();
  await stopStarted;
  await flushTimers();
  resolveStopped();
  await stopPromise;

  assert.equal(calls, 0);
});

test('removes completed timeouts from context timer tracking', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());
  let calls = 0;

  await ctx.start();
  ctx.timeout(0, () => {
    calls += 1;
  });
  await flushTimers();
  await ctx.stop();

  assert.equal(calls, 1);
});

test('logs timer callback errors', async () => {
  const logs: LogMessage[] = [];
  const error = new Error('boom');
  const ctx = Context.fromClient(createMockMilkyClient(), {
    logHandler(message) {
      logs.push(message);
    },
  });

  await ctx.start();
  ctx.timeout(0, () => {
    throw error;
  });
  await flushTimers();
  await ctx.stop();

  assert.deepEqual(logs.map(snapshotLog).at(-1), {
    level: 'error',
    module: 'root',
    message: 'Error handling timer callback',
    error,
  });
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
