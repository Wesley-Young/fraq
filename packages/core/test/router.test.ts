import { createMockInbox, inmsg, inseg } from '@fraqjs/mock';

import { type milky, param, Router, type Session } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

const inbox = createMockInbox();

function session(raw: milky.IncomingMessage): Session {
  return {
    raw,
    async reply() {},
  };
}

function message(segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[]) {
  return inbox.friend({ userId: 1 }, segments);
}

async function dispatch(
  router: Router,
  segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
): Promise<boolean> {
  const raw = message(segments);
  return await router.dispatch(session(raw), raw);
}

test('dispatches a command and captures typed parameters', async () => {
  const router = new Router();
  const calls: Array<{ count: number; label: string }> = [];

  router.command({
    name: 'add',
    pattern: { count: param.num(), label: param.str() },
    execute(_session, params) {
      calls.push(params);
    },
  });

  const handled = await dispatch(router, inmsg`add 3 apples`);

  assert.equal(handled, true);
  assert.deepEqual(calls, [{ count: 3, label: 'apples' }]);
});

test('does not dispatch a command when trailing tokens remain', async () => {
  const router = new Router();
  let called = false;

  router.command({
    name: 'ping',
    pattern: {},
    execute() {
      called = true;
    },
  });

  const handled = await dispatch(router, inmsg`ping extra`);

  assert.equal(handled, false);
  assert.equal(called, false);
});

test('greedy command parameter captures the remaining text', async () => {
  const router = new Router();
  let captured = '';

  router.command({
    name: 'say',
    pattern: { content: param.greedy() },
    execute(_session, params) {
      captured = params.content;
    },
  });

  const handled = await dispatch(router, inmsg`say hello   world`);

  assert.equal(handled, true);
  assert.equal(captured, 'hello   world');
});

test('tries later routes after a command pattern fails', async () => {
  const router = new Router();
  const calls: string[] = [];

  router.command({
    name: 'pick',
    pattern: { value: param.num() },
    execute() {
      calls.push('number');
    },
  });
  router.command({
    name: 'pick',
    pattern: { value: param.str() },
    execute(_session, params) {
      calls.push(params.value);
    },
  });

  const handled = await dispatch(router, inmsg`pick blue`);

  assert.equal(handled, true);
  assert.deepEqual(calls, ['blue']);
});

test('dispatches grouped commands after matching the group prefix', async () => {
  const router = new Router();
  let captured = 0;

  router.group('admin').command({
    name: 'ban',
    pattern: { userId: param.num() },
    execute(_session, params) {
      captured = params.userId;
    },
  });

  const handled = await dispatch(router, inmsg`admin ban 42`);

  assert.equal(handled, true);
  assert.equal(captured, 42);
});

test('matches the first dispatchable branch without running its handler', () => {
  const router = new Router();
  const calls: string[] = [];

  router.command({
    name: 'pick',
    pattern: { value: param.num() },
    execute() {
      calls.push('number');
    },
  });
  router.command({
    name: 'pick',
    pattern: { value: param.str() },
    execute() {
      calls.push('string');
    },
  });

  const raw = message(inmsg`pick blue`);
  const match = router.match(session(raw), raw);

  assert.equal(match?.type, 'command');
  assert.equal(match.command.name, 'pick');
  assert.deepEqual(match.path, []);
  assert.deepEqual(match.params, { value: 'blue' });
  assert.deepEqual(calls, []);
});

test('matches grouped branches with their group path', () => {
  const router = new Router();

  router.group('admin').command({
    name: 'ban',
    pattern: { userId: param.num() },
    execute() {},
  });

  const raw = message(inmsg`admin ban 42`);
  const match = router.match(session(raw), raw);

  assert.equal(match?.type, 'command');
  assert.equal(match.command.name, 'ban');
  assert.deepEqual(match.path, ['admin']);
  assert.deepEqual(match.params, { userId: 42 });
});

test('returns the same router for repeated group names', () => {
  const router = new Router();

  assert.equal(router.group('admin'), router.group('admin'));
});

test('runs filtered routes only when the predicate accepts the session', async () => {
  const router = new Router();
  const calls: string[] = [];

  router
    .filter((session) => session.raw.sender_id === 7)
    .command({
      name: 'secret',
      pattern: {},
      execute() {
        calls.push('secret');
      },
    });

  const rejected = message(inmsg`secret`);
  const accepted = { ...rejected, sender_id: 7 };

  assert.equal(await router.dispatch(session(rejected), rejected), false);
  assert.equal(await router.dispatch(session(accepted), accepted), true);
  assert.deepEqual(calls, ['secret']);
});

test('lists branches that can pass session filters', () => {
  const router = new Router();

  router.command({ name: 'ping', pattern: {}, execute() {} });
  router.group('admin').command({ name: 'ban', pattern: { userId: param.num() }, execute() {} });
  router.filter((session) => session.raw.sender_id === 7).command({ name: 'secret', pattern: {}, execute() {} });
  router
    .filter((session) => session.raw.sender_id === 8)
    .rawPattern({ pattern: { content: param.greedy() }, execute() {} });

  const raw = message(inmsg`anything`);
  const branches = router.branches(session({ ...raw, sender_id: 7 }));

  assert.deepEqual(
    branches.map((branch) => {
      if (branch.type === 'command') {
        return { type: branch.type, path: branch.path, name: branch.command.name };
      }
      return { type: branch.type, path: branch.path };
    }),
    [
      { type: 'command', path: [], name: 'ping' },
      { type: 'command', path: ['admin'], name: 'ban' },
      { type: 'command', path: [], name: 'secret' },
    ],
  );
});

test('dispatches raw patterns without a command prefix', async () => {
  const router = new Router();
  let captured = '';

  router.rawPattern({
    pattern: { content: param.greedy() },
    execute(_session, params) {
      captured = params.content;
    },
  });

  const handled = await dispatch(router, inmsg`anything goes here`);

  assert.equal(handled, true);
  assert.equal(captured, 'anything goes here');
});

test('rejects empty raw patterns and literal-first raw patterns', () => {
  const router = new Router();

  assert.throws(() => router.rawPattern({ pattern: {}, execute() {} }), /at least one parameter/);
  assert.throws(
    () => router.rawPattern({ pattern: { start: param.literal('hello') }, execute() {} }),
    /cannot be a literal/,
  );
});

test('captures non-text segments with segment parameters', async () => {
  const router = new Router();
  const target = inseg.mention(42, 'alice');
  let captured: milky.IncomingMentionSegment | undefined;

  router.command({
    name: 'poke',
    pattern: { target: param.segment('mention') },
    execute(_session, params) {
      captured = params.target;
    },
  });

  const handled = await dispatch(router, inmsg`poke ${target}`);

  assert.equal(handled, true);
  assert.deepEqual(captured, target);
});

test('does not let greedy capture span across non-text segments', async () => {
  const router = new Router();
  let called = false;

  router.command({
    name: 'say',
    pattern: { content: param.greedy() },
    execute() {
      called = true;
    },
  });

  const handled = await dispatch(router, inmsg`say hello ${inseg.mention(42)}`);

  assert.equal(handled, false);
  assert.equal(called, false);
});

test('greedy captures the rest of the current text segment and leaves following segments', async () => {
  const router = new Router();
  const target = inseg.mention(42, 'alice');
  let captured: { content: string; target: milky.IncomingMentionSegment } | undefined;

  router.command({
    name: 'say',
    pattern: { content: param.greedy(), target: param.segment('mention') },
    execute(_session, params) {
      captured = params;
    },
  });

  const handled = await dispatch(router, [inseg.text('say hello   world'), target]);

  assert.equal(handled, true);
  assert.deepEqual(captured, { content: 'hello   world', target });
});

test('catch-all captures remaining text and message segments', async () => {
  const router = new Router();
  const target = inseg.mention(42, 'alice');
  let captured: milky.IncomingSegment[] | undefined;

  router.command({
    name: 'reply',
    pattern: { content: param.catchAll() },
    execute(_session, params) {
      captured = params.content;
    },
  });

  const handled = await dispatch(router, [inseg.text('reply hello   world  '), target]);

  assert.equal(handled, true);
  assert.deepEqual(captured, [inseg.text('hello   world  '), target]);
});

test('catch-all captures remaining segments starting from a non-text segment', async () => {
  const router = new Router();
  const target = inseg.mention(42, 'alice');
  let captured: milky.IncomingSegment[] | undefined;

  router.command({
    name: 'reply',
    pattern: { content: param.catchAll() },
    execute(_session, params) {
      captured = params.content;
    },
  });

  const handled = await dispatch(router, inmsg`reply ${target}`);

  assert.equal(handled, true);
  assert.deepEqual(captured, [target]);
});

test('catch-all does not match empty remaining input', async () => {
  const router = new Router();
  let called = false;

  router.command({
    name: 'reply',
    pattern: { content: param.catchAll() },
    execute() {
      called = true;
    },
  });

  const handled = await dispatch(router, inmsg`reply`);

  assert.equal(handled, false);
  assert.equal(called, false);
});

test('raw pattern catch-all captures a mixed message', async () => {
  const router = new Router();
  const target = inseg.mention(42, 'alice');
  let captured: milky.IncomingSegment[] | undefined;

  router.rawPattern({
    pattern: { content: param.catchAll() },
    execute(_session, params) {
      captured = params.content;
    },
  });

  const handled = await dispatch(router, inmsg`hello ${target}`);

  assert.equal(handled, true);
  assert.deepEqual(captured, [inseg.text('hello '), target]);
});

test('rejects catch-all parameters before the end of a pattern', () => {
  const router = new Router();

  assert.throws(
    () =>
      router.command({
        name: 'reply',
        pattern: { content: param.catchAll(), label: param.str() },
        execute() {},
      }),
    /Catch-all parameters must be the last parameter/,
  );
  assert.throws(
    () =>
      router.rawPattern({
        pattern: { content: param.catchAll(), label: param.str() },
        execute() {},
      }),
    /Catch-all parameters must be the last parameter/,
  );
});
