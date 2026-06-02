import { RandomService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

test('same seed produces the same uint32 sequence', () => {
  const first = new RandomService({ seed: 42 });
  const second = new RandomService({ seed: 42 });

  assert.deepEqual(
    [first.uint32(), first.uint32(), first.uint32()],
    [second.uint32(), second.uint32(), second.uint32()],
  );
});

test('withSeed returns an independent seeded generator', () => {
  const base = new RandomService({ seed: 7 });
  const seeded = base.withSeed(99);
  const direct = new RandomService({ seed: 99 });

  assert.deepEqual(
    [seeded.uint32(), seeded.uint32(), seeded.uint32()],
    [direct.uint32(), direct.uint32(), direct.uint32()],
  );
  assert.notEqual(base.uint32(), seeded.uint32());
});

test('float returns a value in the half-open unit interval', () => {
  const random = new RandomService({ seed: 123 });

  for (let index = 0; index < 16; index += 1) {
    const value = random.float();
    assert.ok(value >= 0);
    assert.ok(value < 1);
  }
});

test('bool respects edge probabilities', () => {
  const random = new RandomService({ seed: 456 });

  assert.equal(random.bool(0), false);
  assert.equal(random.bool(1), true);
});

test('int returns values in the requested half-open interval', () => {
  const random = new RandomService({ seed: 789 });

  for (let index = 0; index < 32; index += 1) {
    const zeroBased = random.int(10);
    const shifted = random.int(3, 8);

    assert.ok(zeroBased >= 0);
    assert.ok(zeroBased < 10);
    assert.ok(shifted >= 3);
    assert.ok(shifted < 8);
  }
});

test('range includes both endpoints', () => {
  const random = new RandomService({ seed: 1357 });
  const seen = new Set<number>();

  for (let index = 0; index < 128; index += 1) {
    seen.add(random.range(1, 3));
  }

  assert.deepEqual([...seen].sort(), [1, 2, 3]);
});

test('pick returns an item from the source array', () => {
  const random = new RandomService({ seed: 2468 });
  const items = ['alpha', 'beta', 'gamma'] as const;

  for (let index = 0; index < 16; index += 1) {
    assert.ok(items.includes(random.pick(items)));
  }
});

test('shuffle returns a deterministic permutation without mutating the input', () => {
  const items = [1, 2, 3, 4, 5];
  const first = new RandomService({ seed: 999 });
  const second = new RandomService({ seed: 999 });

  const shuffled = first.shuffle(items);

  assert.deepEqual(shuffled, second.shuffle(items));
  assert.notEqual(shuffled, items);
  assert.deepEqual(items, [1, 2, 3, 4, 5]);
  assert.deepEqual(
    [...shuffled].sort((a, b) => a - b),
    items,
  );
});

test('sample returns a deterministic subset without replacement', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  const first = new RandomService({ seed: 2025 });
  const second = new RandomService({ seed: 2025 });

  const sampled = first.sample(items, 3);

  assert.deepEqual(sampled, second.sample(items, 3));
  assert.equal(sampled.length, 3);
  assert.equal(new Set(sampled).size, 3);
  assert.ok(sampled.every((item) => items.includes(item)));
});

test('weightedIndex only selects entries with positive weight and stays deterministic', () => {
  const first = new RandomService({ seed: 8080 });
  const second = new RandomService({ seed: 8080 });

  const sequence = [
    first.weightedIndex([0, 1, 0, 3]),
    first.weightedIndex([0, 1, 0, 3]),
    first.weightedIndex([0, 1, 0, 3]),
    first.weightedIndex([0, 1, 0, 3]),
  ];

  assert.deepEqual(sequence, [
    second.weightedIndex([0, 1, 0, 3]),
    second.weightedIndex([0, 1, 0, 3]),
    second.weightedIndex([0, 1, 0, 3]),
    second.weightedIndex([0, 1, 0, 3]),
  ]);
  assert.ok(sequence.every((index) => index === 1 || index === 3));
});

test('weightedPick selects from positive-weight items only', () => {
  const random = new RandomService({ seed: 9090 });
  const items = [
    { label: 'alpha', weight: 0 },
    { label: 'beta', weight: 2 },
    { label: 'gamma', weight: 0 },
    { label: 'delta', weight: 5 },
  ] as const;

  for (let index = 0; index < 16; index += 1) {
    const picked = random.weightedPick(items, (item) => item.weight);
    assert.ok(picked.label === 'beta' || picked.label === 'delta');
  }
});

test('clone preserves the current generator state', () => {
  const original = new RandomService({ seed: 314159 });

  original.uint32();
  original.uint32();

  const clone = original.clone();

  assert.deepEqual(
    [original.uint32(), original.uint32(), original.uint32()],
    [clone.uint32(), clone.uint32(), clone.uint32()],
  );
});

test('exportState captures the current pcg32 state', () => {
  const random = new RandomService({ seed: 2024 });

  random.uint32();

  const state = random.exportState();
  const clone = random.clone();

  assert.deepEqual(state, clone.exportState());
});

test('fromState resumes the exported generator state', () => {
  const original = new RandomService({ seed: 4242, sequence: 7 });

  original.uint32();
  original.uint32();

  const restored = RandomService.fromState(original.exportState());

  assert.deepEqual(
    [original.uint32(), original.uint32(), original.uint32()],
    [restored.uint32(), restored.uint32(), restored.uint32()],
  );
});

test('rejects non-safe integer seeds and sequences', () => {
  assert.throws(() => new RandomService({ seed: Number.NaN }), /seed/);
  assert.throws(() => new RandomService({ sequence: 1.5 }), /sequence/);
  assert.throws(() => new RandomService().withSeed(Number.MAX_SAFE_INTEGER + 1), /seed/);
});

test('rejects invalid business api arguments', () => {
  const random = new RandomService();

  assert.throws(() => random.bool(-0.1), /probability/);
  assert.throws(() => random.int(0), /maxExclusive/);
  assert.throws(() => random.int(5, 5), /maxExclusive/);
  assert.throws(() => random.range(3, 2), /maxInclusive/);
  assert.throws(() => random.pick([]), /items/);
  assert.throws(() => random.sample([1, 2], -1), /count/);
  assert.throws(() => random.sample([1, 2], 3), /count/);
  assert.throws(() => random.weightedIndex([]), /items/);
  assert.throws(() => random.weightedIndex([0, 0]), /positive/);
  assert.throws(() => random.weightedIndex([1, -1]), /weights\[1\]/);
  assert.throws(() => random.weightedPick([], () => 1), /items/);
  assert.throws(() => random.weightedPick([1, 2], () => Number.NaN), /weightOf/);
});
