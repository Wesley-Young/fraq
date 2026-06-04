import { Context } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';
import type { Kysely } from 'kysely';

import KyselyPlugin, { DatabaseService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

interface TestDatabase {
  user_account: {
    id: number;
    name: string;
  };
}

test('provides a working Kysely database service backed by node:sqlite', async () => {
  const ctx = Context.fromClient(createMockMilkyClient());

  ctx.install(KyselyPlugin, { sqliteUrl: ':memory:' });
  await ctx.start();

  const db = ctx.resolve(DatabaseService).kysely as unknown as Kysely<TestDatabase>;

  await db.schema
    .createTable('user_account')
    .addColumn('id', 'integer', (column) => column.primaryKey())
    .addColumn('name', 'text', (column) => column.notNull())
    .execute();

  await db.insertInto('user_account').values({ id: 1, name: 'alpha' }).execute();

  const row = await db.selectFrom('user_account').selectAll().executeTakeFirst();

  assert.ok(row);
  assert.equal(row.id, 1);
  assert.equal(row.name, 'alpha');

  await ctx.stop();
});
