import { type milky, param, Router, type Session } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function text(text: string): milky.IncomingTextSegment {
  return {
    type: 'text',
    data: { text },
  };
}

function mention(userId: number, name = 'tester'): milky.IncomingMentionSegment {
  return {
    type: 'mention',
    data: {
      user_id: userId,
      name,
    },
  };
}

function message(segments: milky.IncomingSegment[]): milky.IncomingMessage {
  return {
    message_scene: 'friend',
    peer_id: 1,
    message_seq: 1,
    sender_id: 1,
    time: 1,
    segments,
    friend: {} as milky.FriendEntity,
  };
}

function session(raw: milky.IncomingMessage): Session {
  return {
    raw,
    async reply() {},
  };
}

async function dispatch(router: Router, segments: milky.IncomingSegment[]): Promise<boolean> {
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

  const handled = await dispatch(router, [text('add 3 apples')]);

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

  const handled = await dispatch(router, [text('ping extra')]);

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

  const handled = await dispatch(router, [text('say hello   world')]);

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

  const handled = await dispatch(router, [text('pick blue')]);

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

  const handled = await dispatch(router, [text('admin ban 42')]);

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

  const raw = message([text('pick blue')]);
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

  const raw = message([text('admin ban 42')]);
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

  const rejected = message([text('secret')]);
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

  const raw = message([text('anything')]);
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

  const handled = await dispatch(router, [text('anything goes here')]);

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
  const target = mention(42, 'alice');
  let captured: milky.IncomingMentionSegment | undefined;

  router.command({
    name: 'poke',
    pattern: { target: param.segment('mention') },
    execute(_session, params) {
      captured = params.target;
    },
  });

  const handled = await dispatch(router, [text('poke'), target]);

  assert.equal(handled, true);
  assert.equal(captured, target);
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

  const handled = await dispatch(router, [text('say hello'), mention(42)]);

  assert.equal(handled, false);
  assert.equal(called, false);
});
