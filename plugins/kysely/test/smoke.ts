import { Context, definePlugin } from '@fraqjs/fraq';
import { createSimpleLogHandler } from '@fraqjs/mock';
import type { Kysely } from 'kysely';

import KyselyPlugin, { DatabaseService } from '../src';

interface TestDatabase {
  user_account: {
    id: number;
    name: string;
  };
}

const ctx = Context.fromUrl('http://localhost:30001', {
  logHandler: createSimpleLogHandler(),
});

ctx.install(KyselyPlugin, {
  sqliteUrl: ':memory:',
});

ctx.install(
  definePlugin({
    name: 'kysely-smoke-test',
    inject: {
      db: DatabaseService,
    },
    apply(ctx) {
      ctx.db.schemas.register({
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
    async start(ctx) {
      const kysely = ctx.db.kysely as unknown as Kysely<TestDatabase>;
      await kysely.insertInto('user_account').values({ id: 1, name: 'alpha' }).execute();

      const results = await kysely.selectFrom('user_account').selectAll().execute();
      console.log(results);
    },
  }),
);

ctx.start();
