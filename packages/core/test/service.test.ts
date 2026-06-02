import { Context, definePlugin } from '../src';
import { createMockMilkyClient } from './util/mock';

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
  return Context.fromClient(createMockMilkyClient());
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
  const child = parent.fork('child');
  const alpha = new AlphaService();

  parent.provide(AlphaService, alpha);

  assert.equal(child.resolve(AlphaService), alpha);
});

test('sub contexts can override parent services without affecting parent', () => {
  const parent = createTestContext();
  const child = parent.fork('child');
  const parentAlpha = new AlphaService();
  const childAlpha = new AlphaService();

  parent.provide(AlphaService, parentAlpha);
  child.provide(AlphaService, childAlpha);

  assert.equal(parent.resolve(AlphaService), parentAlpha);
  assert.equal(child.resolve(AlphaService), childAlpha);
});

test('sorts plugins by service dependencies', async () => {
  const ctx = createTestContext();
  const calls: string[] = [];

  const BetaPlugin = definePlugin({
    name: 'beta',
    requires: [AlphaService],
    provides: [BetaService],
    apply(ctx) {
      calls.push('beta');
      ctx.provide(BetaService, new BetaService(ctx.resolve(AlphaService)));
    },
  });
  const AlphaPlugin = definePlugin({
    name: 'alpha',
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

test('injects existing services onto plugin context proxies', async () => {
  const ctx = createTestContext();
  const alpha = new AlphaService();
  let injectedAlpha: AlphaService | undefined;

  ctx.provide(AlphaService, alpha);
  ctx.install(
    definePlugin({
      name: 'alpha-consumer',
      inject: {
        alpha: AlphaService,
      },
      apply(ctx) {
        injectedAlpha = ctx.alpha;
      },
    }),
  );

  await ctx.start();

  assert.equal(injectedAlpha, alpha);
});

test('uses injected services to order and apply plugin dependencies', async () => {
  const ctx = createTestContext();
  const calls: string[] = [];
  let injectedAlpha: AlphaService | undefined;

  ctx.install(
    definePlugin({
      name: 'beta-provider',
      inject: {
        alpha: AlphaService,
      },
      provides: [BetaService],
      apply(ctx) {
        calls.push('beta');
        injectedAlpha = ctx.alpha;
        ctx.provide(BetaService, new BetaService(ctx.alpha));
      },
    }),
  );
  ctx.install(
    definePlugin({
      name: 'alpha-provider',
      provides: [AlphaService],
      apply(ctx) {
        calls.push('alpha');
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );

  await ctx.start();

  assert.deepEqual(calls, ['alpha', 'beta']);
  assert.equal(ctx.resolve(BetaService).alpha, injectedAlpha);
  assert.equal(injectedAlpha, ctx.resolve(AlphaService));
});

test('preserves install order when plugins do not depend on each other', async () => {
  const ctx = createTestContext();
  const calls: string[] = [];

  ctx.install(
    definePlugin({
      name: 'first',
      apply() {
        calls.push('first');
      },
    }),
  );
  ctx.install(
    definePlugin({
      name: 'second',
      apply() {
        calls.push('second');
      },
    }),
  );

  await ctx.start();

  assert.deepEqual(calls, ['first', 'second']);
});

test('rejects startup when a required service is missing', async () => {
  const ctx = createTestContext();

  ctx.install(
    definePlugin({
      name: 'requires-alpha',
      requires: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => ctx.start(), /AlphaService.*no installed plugin provides it/);
});

test('rejects startup when multiple plugins declare the same provided service', async () => {
  const ctx = createTestContext();

  ctx.install(
    definePlugin({
      name: 'alpha-provider-a',
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );
  ctx.install(
    definePlugin({
      name: 'alpha-provider-b',
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );

  await assert.rejects(() => ctx.start(), /AlphaService.*multiple plugins/);
});

test('rejects startup when plugin service dependencies form a cycle', async () => {
  const ctx = createTestContext();

  ctx.install(
    definePlugin({
      name: 'cycle-alpha-provider',
      requires: [BetaService],
      provides: [AlphaService],
      apply(ctx) {
        ctx.provide(AlphaService, new AlphaService());
      },
    }),
  );
  ctx.install(
    definePlugin({
      name: 'cycle-beta-provider',
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
  const ctx = createTestContext();

  ctx.install(
    definePlugin({
      name: 'missing-alpha-provider',
      provides: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => ctx.start(), /declares service AlphaService but did not provide it/);
});

test('does not count inherited services as provided by a child plugin', async () => {
  const parent = createTestContext();
  const child = parent.fork('child');

  parent.provide(AlphaService, new AlphaService());
  child.install(
    definePlugin({
      name: 'inherited-alpha-provider',
      provides: [AlphaService],
      apply() {},
    }),
  );

  await assert.rejects(() => child.start(), /declares service AlphaService but did not provide it/);
});

test('rejects startup when a plugin throws and skips later plugins', async () => {
  const ctx = createTestContext();
  const calls: string[] = [];

  ctx.install(
    definePlugin({
      name: 'throwing',
      apply() {
        calls.push('throwing');
        throw new Error('boom');
      },
    }),
  );
  ctx.install(
    definePlugin({
      name: 'later',
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
  const child = parent.fork('child');
  const alpha = new AlphaService();

  parent.provide(AlphaService, alpha);
  child.install(
    definePlugin({
      name: 'beta-from-parent-alpha',
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
  const child = parent.fork('child');
  const parentAlpha = new AlphaService();

  parent.provide(AlphaService, parentAlpha);
  child.install(
    definePlugin({
      name: 'child-alpha-provider',
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
  const ctx = createTestContext();
  const alpha = new AlphaService();

  ctx.provide(AlphaService, alpha);
  ctx.install(
    definePlugin({
      name: 'gamma-from-existing-alpha',
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
