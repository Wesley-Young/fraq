import { Context, type milky } from '@fraqjs/fraq';

import { createMockMilkyClient, inmsg, MockInbox } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

test('mock client receives inbox-backed friend messages through the event stream', async () => {
  const client = createMockMilkyClient();
  const ctx = Context.fromClient(client);
  const received: milky.IncomingMessage[] = [];

  ctx.on('message_receive', ({ data }) => {
    received.push(data);
  });

  await ctx.start();
  const message = await client.receiveFriend({ userId: 10001 }, inmsg`ping`);

  assert.equal(received.length, 1);
  assert.equal(received[0], message);
});

test('built-in message query APIs read from the inbox state', async () => {
  const inbox = new MockInbox({ baseTime: 100 });
  const client = createMockMilkyClient({ inbox });

  const first = inbox.group({ groupId: 20001, userId: 10001 }, inmsg`one`);
  const second = inbox.group({ groupId: 20001, userId: 10002 }, inmsg`two`);

  const one = await client.get_message({
    message_scene: 'group',
    peer_id: 20001,
    message_seq: first.message_seq,
  });
  const history = await client.get_history_messages({
    message_scene: 'group',
    peer_id: 20001,
    limit: 1,
  });
  const groupInfo = await client.get_group_info({
    group_id: 20001,
    no_cache: false,
  });
  const memberInfo = await client.get_group_member_info({
    group_id: 20001,
    user_id: 10002,
    no_cache: false,
  });

  assert.equal(one.message, first);
  assert.deepEqual(history, {
    messages: [second],
    next_message_seq: first.message_seq,
  });
  assert.equal(groupInfo.group, second.group);
  assert.equal(memberInfo.member, second.group_member);
});

test('later stubbed API handlers override earlier handlers, including built-ins', async () => {
  const client = createMockMilkyClient();

  client.stubApi('get_friend_info', () => ({
    friend: {
      user_id: 10001,
      nickname: 'Alpha',
      sex: 'unknown',
      qid: 'qid_alpha',
      remark: '',
      category: {
        category_id: 1,
        category_name: 'General',
      },
    },
  }));
  client.stubApi('get_friend_info', () => ({
    friend: {
      user_id: 10001,
      nickname: 'Override',
      sex: 'unknown',
      qid: 'qid_override',
      remark: 'pinned',
      category: {
        category_id: 2,
        category_name: 'VIP',
      },
    },
  }));

  const result = await client.get_friend_info({
    user_id: 10001,
    no_cache: false,
  });

  assert.equal(result.friend.nickname, 'Override');
  assert.deepEqual(client.apiCalls, [
    {
      endpoint: 'get_friend_info',
      params: {
        user_id: 10001,
        no_cache: false,
      },
    },
  ]);
});
