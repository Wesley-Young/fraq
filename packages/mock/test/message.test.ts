import { createMockInbox, inmsg, inseg } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

test('inmsg builds incoming segments and trims boundary text', () => {
  const segments = inmsg`
ping ${inseg.mention(10001, 'Alice')} pong
  `;

  assert.deepEqual(segments, [
    {
      type: 'text',
      data: {
        text: 'ping ',
      },
    },
    {
      type: 'mention',
      data: {
        user_id: 10001,
        name: 'Alice',
      },
    },
    {
      type: 'text',
      data: {
        text: ' pong',
      },
    },
  ]);
});

test('mock inbox increments message sequence and time per conversation', () => {
  const inbox = createMockInbox({
    baseTime: 1000,
    timeStepSeconds: 5,
  });

  const first = inbox.friend({ userId: 10001 }, inmsg`ping`);
  const second = inbox.friend({ userId: 10001 }, inmsg`pong`);
  const group = inbox.group({ groupId: 20001, userId: 10001 }, inmsg`hello`);

  assert.equal(first.message_seq, 1);
  assert.equal(second.message_seq, 2);
  assert.equal(first.time, 1000);
  assert.equal(second.time, 1005);
  assert.equal(group.message_seq, 1);
  assert.equal(group.time, 1000);
});

test('explicit message metadata advances the conversation cursor', () => {
  const inbox = createMockInbox({
    baseTime: 10,
  });

  const first = inbox.friend({ userId: 10001, messageSeq: 7, time: 25 }, inmsg`manual`);
  const second = inbox.friend({ userId: 10001 }, inmsg`next`);

  assert.equal(first.message_seq, 7);
  assert.equal(first.time, 25);
  assert.equal(second.message_seq, 8);
  assert.equal(second.time, 26);
});

test('reply segments can be created from previously generated messages', () => {
  const inbox = createMockInbox();
  const origin = inbox.friend({ userId: 10001 }, inmsg`hello`);
  const reply = inbox.friend({ userId: 10001 }, inmsg`${inseg.reply(origin)} world`);

  const replySegment = reply.segments[0];

  assert.ok(replySegment);
  assert.equal(replySegment.type, 'reply');
  assert.deepEqual(replySegment.data, {
    message_seq: origin.message_seq,
    sender_id: origin.sender_id,
    sender_name: undefined,
    time: origin.time,
    segments: origin.segments,
  });
});

test('history and event helpers expose stored messages', () => {
  const inbox = createMockInbox({ selfId: 54321 });
  const conversationKey = inbox.friendConversationKey(10001);
  const first = inbox.friend({ userId: 10001 }, inmsg`one`);
  const second = inbox.friend({ userId: 10001 }, inmsg`two`);
  const event = inbox.event(second);

  assert.deepEqual(inbox.history(conversationKey), [first, second]);
  assert.equal(inbox.lastMessage(conversationKey), second);
  assert.equal(inbox.message(conversationKey, second.message_seq), second);
  assert.equal(event.self_id, 54321);
  assert.equal(event.data, second);
});
