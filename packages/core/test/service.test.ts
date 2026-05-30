import { Context, definePlugin } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

class AlphaService {
  readonly value = 'alpha';
}

class BetaService {
  constructor(readonly alpha: AlphaService) {}
}

class GammaService {}

function createTestContext(): Context {
  return Context.create({
    connect: {
      baseUrl: 'http://localhost:30001/',
    },
  });
}

function createStartableContext(): Context {
  return createTestContext().fork();
}

test('provides and resolves service instances by class', () => {
  const ctx = createTestContext();
  const alpha = new AlphaService();

  ctx.provide(AlphaService, alpha);

  const resolved: AlphaService = ctx.resolve(AlphaService);
  assert.equal(resolved, alpha);
});

test('reports missing services through resolve, tryResolve, and has', () => {
  const ctx = createTestContext();

  assert.throws(() => ctx.resolve(AlphaService), /AlphaService/);
  assert.equal(ctx.tryResolve(AlphaService), undefined);
  assert.equal(ctx.isProvided(AlphaService), false);
});

test('rejects duplicate service providers in the same context', () => {
  const ctx = createTestContext();

  ctx.provide(AlphaService, new AlphaService());

  assert.throws(() => ctx.provide(AlphaService, new AlphaService()), /already been provided/);
});

test('sub contexts inherit parent services', () => {
  const parent = createTestContext();
  const child = parent.fork();
  const alpha = new AlphaService();

  parent.provide(AlphaService, alpha);

  assert.equal(child.resolve(AlphaService), alpha);
});

test('sub contexts can override parent services without affecting parent', () => {
  const parent = createTestContext();
  const child = parent.fork();
  const parentAlpha = new AlphaService();
  const childAlpha = new AlphaService();

  parent.provide(AlphaService, parentAlpha);
  child.provide(AlphaService, childAlpha);

  assert.equal(parent.resolve(AlphaService), parentAlpha);
  assert.equal(child.resolve(AlphaService), childAlpha);
});

test('sorts plugins by service dependencies', async () => {
  const ctx = createStartableContext();
  const calls: string[] = [];

  const BetaPlugin = definePlugin({
    requires: [AlphaService],
    provides: [BetaService],
    apply(ctx) {
      calls.push('beta');
      ctx.provide(BetaService, new BetaService(ctx.resolve(AlphaService)));
    },
  });
  const AlphaPlugin = definePlugin({
    provides: [AlphaService],
    apply(ctx) {
      calls.push('alpha');
      ctx.provide(AlphaService, new AlphaService());
    },
  });

  ctx.install(BetaPlugin);
  ctx.install(AlphaPlugin);

  await ctx.start();

  assert.deepEqual(calls, ['alpha', 'beta']);
  assert.equal(ctx.resolve(BetaService).alpha, ctx.resolve(AlphaService));
});

test('preserves install order when plugins do not depend on each other', async () => {
  const ctx = createStartableContext();
  const calls: string[] = [];

  ctx.install(
    definePlugin({
      apply() {
        calls.push('first');
      },
    }),
  );
  ctx.install(
    definePlugin({
      apply() {
        calls.push('second');
      },
    }),
  );

  await ctx.start();

  assert.deepEqual(calls, ['first', 'second']);
});

test('rejects startup when a required service is missing', async () => {
  const ctx = createStartableContext();

  ctx.install(
    definePlugin({
      requires: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => ctx.start(), /AlphaService.*no installed plugin provides it/);
});

test('rejects startup when multiple plugins declare the same provided service', async () => {
  const ctx = createStartableContext();

  ctx.install(
    definePlugin({
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );
  ctx.install(
    definePlugin({
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );

  await assert.rejects(() => ctx.start(), /AlphaService.*multiple plugins/);
});

test('rejects startup when plugin service dependencies form a cycle', async () => {
  const ctx = createStartableContext();

  ctx.install(
    definePlugin({
      requires: [BetaService],
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );
  ctx.install(
    definePlugin({
      requires: [AlphaService],
      provides: [BetaService],
      apply(ctx) {
        ctx.provide(BetaService, new BetaService(ctx.resolve(AlphaService)));
      },
    }),
  );

  await assert.rejects(() => ctx.start(), /dependency cycle/);
});

test('rejects startup when a plugin declares but does not provide a service', async () => {
  const ctx = createStartableContext();

  ctx.install(
    definePlugin({
      provides: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => ctx.start(), /declares service AlphaService but did not provide it/);
});

test('does not count inherited services as provided by a child plugin', async () => {
  const parent = createTestContext();
  const child = parent.fork();

  parent.provide(AlphaService, new AlphaService());
  child.install(
    definePlugin({
      provides: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => child.start(), /declares service AlphaService but did not provide it/);
});

test('rejects startup when a plugin throws and skips later plugins', async () => {
  const ctx = createStartableContext();
  const calls: string[] = [];

  ctx.install(
    definePlugin({
      apply() {
        calls.push('throwing');
        throw new Error('boom');
      },
    }),
  );
  ctx.install(
    definePlugin({
      apply() {
        calls.push('later');
      },
    }),
  );

  await assert.rejects(() => ctx.start(), /boom/);
  assert.deepEqual(calls, ['throwing']);
});

test('uses services from parent contexts to satisfy plugin dependencies', async () => {
  const parent = createTestContext();
  const child = parent.fork();
  const alpha = new AlphaService();

  parent.provide(AlphaService, alpha);
  child.install(
    definePlugin({
      requires: [AlphaService],
      provides: [BetaService],
      apply(ctx) {
        ctx.provide(BetaService, new BetaService(ctx.resolve(AlphaService)));
      },
    }),
  );

  await child.start();

  assert.equal(child.resolve(BetaService).alpha, alpha);
});

test('allows a sub context plugin to override a parent service', async () => {
  const parent = createTestContext();
  const child = parent.fork();
  const parentAlpha = new AlphaService();

  parent.provide(AlphaService, parentAlpha);
  child.install(
    definePlugin({
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );

  await child.start();

  assert.notEqual(child.resolve(AlphaService), parentAlpha);
  assert.equal(parent.resolve(AlphaService), parentAlpha);
});

test('resolves dependencies against services provided before startup', async () => {
  const ctx = createStartableContext();
  const alpha = new AlphaService();

  ctx.provide(AlphaService, alpha);
  ctx.install(
    definePlugin({
      requires: [AlphaService],
      provides: [GammaService],
      apply(ctx) {
        assert.equal(ctx.resolve(AlphaService), alpha);
        ctx.provide(GammaService, new GammaService());
      },
    }),
  );

  await ctx.start();

  assert.ok(ctx.resolve(GammaService) instanceof GammaService);
});
