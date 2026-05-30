import { param, Router, type Session, type types } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function text(text: string): types.IncomingTextSegment {
  return {
    type: 'text',
    data: { text },
  };
}

function mention(userId: number, name = 'tester'): types.IncomingMentionSegment {
  return {
    type: 'mention',
    data: {
      user_id: userId,
      name,
    },
  };
}

function message(segments: types.IncomingSegment[]): types.IncomingMessage {
  return {
    message_scene: 'friend',
    peer_id: 1,
    message_seq: 1,
    sender_id: 1,
    time: 1,
    segments,
    friend: {} as types.FriendEntity,
  };
}

function session(raw: types.IncomingMessage): Session {
  return {
    raw,
    async reply() {},
  };
}

async function dispatch(router: Router, segments: types.IncomingSegment[]): Promise<boolean> {
  const raw = message(segments);
  return await router.dispatch(session(raw), raw);
}

test('dispatches a command and captures typed parameters', async () => {
  const router = new Router();
  const calls: Array<{ count: number; label: string }> = [];

  router.command('add', { count: param.num(), label: param.str() }, (_session, params) => {
    calls.push(params);
  });

  const handled = await dispatch(router, [text('add 3 apples')]);

  assert.equal(handled, true);
  assert.deepEqual(calls, [{ count: 3, label: 'apples' }]);
});

test('does not dispatch a command when trailing tokens remain', async () => {
  const router = new Router();
  let called = false;

  router.command('ping', {}, () => {
    called = true;
  });

  const handled = await dispatch(router, [text('ping extra')]);

  assert.equal(handled, false);
  assert.equal(called, false);
});

test('greedy command parameter captures the remaining text', async () => {
  const router = new Router();
  let captured = '';

  router.command('say', { content: param.greedy() }, (_session, params) => {
    captured = params.content;
  });

  const handled = await dispatch(router, [text('say hello   world')]);

  assert.equal(handled, true);
  assert.equal(captured, 'hello   world');
});

test('tries later routes after a command pattern fails', async () => {
  const router = new Router();
  const calls: string[] = [];

  router.command('pick', { value: param.num() }, () => {
    calls.push('number');
  });
  router.command('pick', { value: param.str() }, (_session, params) => {
    calls.push(params.value);
  });

  const handled = await dispatch(router, [text('pick blue')]);

  assert.equal(handled, true);
  assert.deepEqual(calls, ['blue']);
});

test('dispatches grouped commands after matching the group prefix', async () => {
  const router = new Router();
  let captured = 0;

  router.group('admin').command('ban', { userId: param.num() }, (_session, params) => {
    captured = params.userId;
  });

  const handled = await dispatch(router, [text('admin ban 42')]);

  assert.equal(handled, true);
  assert.equal(captured, 42);
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
    .command('secret', {}, () => {
      calls.push('secret');
    });

  const rejected = message([text('secret')]);
  const accepted = { ...rejected, sender_id: 7 };

  assert.equal(await router.dispatch(session(rejected), rejected), false);
  assert.equal(await router.dispatch(session(accepted), accepted), true);
  assert.deepEqual(calls, ['secret']);
});

test('dispatches raw patterns without a command prefix', async () => {
  const router = new Router();
  let captured = '';

  router.rawPattern({ content: param.greedy() }, (_session, params) => {
    captured = params.content;
  });

  const handled = await dispatch(router, [text('anything goes here')]);

  assert.equal(handled, true);
  assert.equal(captured, 'anything goes here');
});

test('rejects empty raw patterns and literal-first raw patterns', () => {
  const router = new Router();

  assert.throws(() => router.rawPattern({}, () => {}), /at least one parameter/);
  assert.throws(() => router.rawPattern({ start: param.literal('hello') }, () => {}), /cannot be a literal/);
});

test('captures non-text segments with segment parameters', async () => {
  const router = new Router();
  const target = mention(42, 'alice');
  let captured: types.IncomingMentionSegment | undefined;

  router.command('poke', { target: param.segment('mention') }, (_session, params) => {
    captured = params.target;
  });

  const handled = await dispatch(router, [text('poke'), target]);

  assert.equal(handled, true);
  assert.equal(captured, target);
});

test('does not let greedy capture span across non-text segments', async () => {
  const router = new Router();
  let called = false;

  router.command('say', { content: param.greedy() }, () => {
    called = true;
  });

  const handled = await dispatch(router, [text('say hello'), mention(42)]);

  assert.equal(handled, false);
  assert.equal(called, false);
});
