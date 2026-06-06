import { msg, seg } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

test('msg trims boundary whitespace from text-only messages', () => {
  assert.deepEqual(msg`  hello   world  `, [{ type: 'text', data: { text: 'hello   world' } }]);
});

test('msg trims empty boundary text around non-text segments', () => {
  assert.deepEqual(msg`  ${seg.face(1)}  `, [seg.face(1)]);
});

test('msg preserves text spacing between segments', () => {
  assert.deepEqual(msg`foo ${seg.face(1)} bar`, [
    { type: 'text', data: { text: 'foo ' } },
    seg.face(1),
    { type: 'text', data: { text: ' bar' } },
  ]);
});

test('msg preserves leading text after a leading non-text segment', () => {
  assert.deepEqual(msg`${seg.face(1)} hello `, [seg.face(1), { type: 'text', data: { text: ' hello' } }]);
});

test('msg trims primitive interpolation when it is message boundary text', () => {
  const content = '  hello  ';

  assert.deepEqual(msg`${content}`, [{ type: 'text', data: { text: 'hello' } }]);
});
