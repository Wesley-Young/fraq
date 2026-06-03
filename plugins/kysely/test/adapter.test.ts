import { Kysely, SqliteDialect } from 'kysely';

import { NodeSqliteDatabaseAdapter } from '../src/node-sqlite-adapter';

import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

interface TestDatabase {
  user_account: {
    id: number;
    name: string;
  };
}

function createDatabase(): Kysely<TestDatabase> {
  const native = new DatabaseSync(':memory:');
  return new Kysely<TestDatabase>({
    dialect: new SqliteDialect({
      database: new NodeSqliteDatabaseAdapter(native),
    }),
  });
}

test('adapts node:sqlite into a working Kysely sqlite database', async () => {
  const db = createDatabase();

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

  await db.destroy();
});
