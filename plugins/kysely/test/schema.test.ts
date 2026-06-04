import { Context, definePlugin } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';
import type { Kysely } from 'kysely';

import { DatabaseService, KyselyPlugin } from '../src';

import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

interface TestDatabase {
  user_account: {
    id: number;
    name: string;
  };
}

test('registers schemas and migrates them to latest during startup', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  ctx.install(KyselyPlugin, { sqliteUrl: ':memory:' });
  ctx.install(
    definePlugin({
      name: 'test-schema',
      requires: [DatabaseService],
      apply(ctx) {
        ctx.resolve(DatabaseService).schemas.register({
          name: 'test',
          migrations: {
            '001_create_user_account': {
              async up(db) {
                await db.schema
                  .createTable('user_account')
                  .addColumn('id', 'integer', (column) => column.primaryKey())
                  .addColumn('name', 'text', (column) => column.notNull())
                  .execute();
              },
            },
          },
        });
      },
    }),
  );

  await ctx.start();

  const db = ctx.resolve(DatabaseService).kysely as unknown as Kysely<TestDatabase>;
  await db.insertInto('user_account').values({ id: 1, name: 'alpha' }).execute();

  const row = await db.selectFrom('user_account').selectAll().executeTakeFirst();
  const status = await ctx.resolve(DatabaseService).schemas.getStatus('test');

  assert.ok(row);
  assert.equal(row.id, 1);
  assert.equal(row.name, 'alpha');
  assert.deepEqual(status, [
    {
      name: 'test',
      applied: ['001_create_user_account'],
      pending: [],
    },
  ]);

  await ctx.stop();
});

test('migrateToLatest can be called again after migrations have already run', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());
  let migrationRuns = 0;

  ctx.install(KyselyPlugin, { sqliteUrl: ':memory:' });
  ctx.install(
    definePlugin({
      name: 'repeatable-schema',
      requires: [DatabaseService],
      apply(ctx) {
        ctx.resolve(DatabaseService).schemas.register({
          name: 'repeatable',
          migrations: {
            '001_create_repeatable_item': {
              async up(db) {
                migrationRuns += 1;
                await db.schema
                  .createTable('repeatable_item')
                  .addColumn('id', 'integer', (column) => column.primaryKey())
                  .execute();
              },
            },
          },
        });
      },
    }),
  );

  await ctx.start();

  const schema = ctx.resolve(DatabaseService).schemas;
  const firstStatus = await schema.getStatus('repeatable');

  await schema.migrateToLatest();

  const secondStatus = await schema.getStatus('repeatable');

  assert.equal(migrationRuns, 1);
  assert.deepEqual(secondStatus, firstStatus);

  await ctx.stop();
});

test('runs migrations in the order they are registered', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());
  const calls: string[] = [];

  ctx.install(KyselyPlugin, { sqliteUrl: ':memory:' });
  ctx.install(
    definePlugin({
      name: 'ordered-schema',
      requires: [DatabaseService],
      apply(ctx) {
        ctx.resolve(DatabaseService).schemas.register({
          name: 'ordered',
          migrations: {
            '002_create_ordered_item': {
              async up(db) {
                calls.push('002_create_ordered_item');
                await db.schema
                  .createTable('ordered_item')
                  .addColumn('id', 'integer', (column) => column.primaryKey())
                  .execute();
              },
            },
            '001_insert_ordered_item': {
              async up(db) {
                calls.push('001_insert_ordered_item');
                await db.insertInto('ordered_item').values({ id: 1 }).execute();
              },
            },
          },
        });
      },
    }),
  );

  await ctx.start();

  const status = await ctx.resolve(DatabaseService).schemas.getStatus('ordered');

  assert.deepEqual(calls, ['002_create_ordered_item', '001_insert_ordered_item']);
  assert.deepEqual(status, [
    {
      name: 'ordered',
      applied: ['002_create_ordered_item', '001_insert_ordered_item'],
      pending: [],
    },
  ]);

  await ctx.stop();
});

test('migrateToLatest applies newly registered migrations after schema changes', async (t) => {
  const tempDir = await mkdtemp(join(tmpdir(), 'fraq-kysely-'));
  t.after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });
  const sqliteUrl = join(tempDir, 'database.sqlite');

  const firstCtx = Context.fromClient(createMockMilkyClient());
  firstCtx.install(KyselyPlugin, { sqliteUrl });
  firstCtx.install(
    definePlugin({
      name: 'evolving-schema-v1',
      requires: [DatabaseService],
      apply(ctx) {
        ctx.resolve(DatabaseService).schemas.register({
          name: 'evolving',
          migrations: {
            '001_create_evolving_item': {
              async up(db) {
                await db.schema
                  .createTable('evolving_item')
                  .addColumn('id', 'integer', (column) => column.primaryKey())
                  .addColumn('name', 'text', (column) => column.notNull())
                  .execute();
              },
            },
          },
        });
      },
    }),
  );

  await firstCtx.start();
  const firstStatus = await firstCtx.resolve(DatabaseService).schemas.getStatus('evolving');
  assert.deepEqual(firstStatus, [
    {
      name: 'evolving',
      applied: ['001_create_evolving_item'],
      pending: [],
    },
  ]);
  await firstCtx.stop();

  let createTableRuns = 0;
  let addColumnRuns = 0;
  const secondCtx = Context.fromClient(createMockMilkyClient());
  secondCtx.install(KyselyPlugin, { sqliteUrl });
  secondCtx.install(
    definePlugin({
      name: 'evolving-schema-v2',
      requires: [DatabaseService],
      apply(ctx) {
        ctx.resolve(DatabaseService).schemas.register({
          name: 'evolving',
          migrations: {
            '001_create_evolving_item': {
              async up(db) {
                createTableRuns += 1;
                await db.schema
                  .createTable('evolving_item')
                  .addColumn('id', 'integer', (column) => column.primaryKey())
                  .addColumn('name', 'text', (column) => column.notNull())
                  .execute();
              },
            },
            '002_add_evolving_item_description': {
              async up(db) {
                addColumnRuns += 1;
                await db.schema.alterTable('evolving_item').addColumn('description', 'text').execute();
              },
            },
          },
        });
      },
    }),
  );

  await secondCtx.start();

  interface EvolvedDatabase {
    evolving_item: {
      id: number;
      name: string;
      description: string | null;
    };
  }

  const db = secondCtx.resolve(DatabaseService).kysely as unknown as Kysely<EvolvedDatabase>;
  await db.insertInto('evolving_item').values({ id: 1, name: 'alpha', description: 'migrated' }).execute();

  const row = await db.selectFrom('evolving_item').selectAll().executeTakeFirst();
  const secondStatus = await secondCtx.resolve(DatabaseService).schemas.getStatus('evolving');

  assert.equal(createTableRuns, 0);
  assert.equal(addColumnRuns, 1);
  assert.ok(row);
  assert.equal(row.description, 'migrated');
  assert.deepEqual(secondStatus, [
    {
      name: 'evolving',
      applied: ['001_create_evolving_item', '002_add_evolving_item_description'],
      pending: [],
    },
  ]);

  await secondCtx.stop();
});
