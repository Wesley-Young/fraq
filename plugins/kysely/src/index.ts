import { definePlugin } from '@fraqjs/fraq';
import { Kysely, SqliteDialect } from 'kysely';

import { DatabaseService } from './database';
import { NodeSqliteDatabaseAdapter } from './node-sqlite-adapter';
import type { FraqDatabase } from './types';

import { DatabaseSync, type DatabaseSyncOptions } from 'node:sqlite';

export interface KyselyPluginOptions {
  sqliteUrl: string;
  nodeSqliteOptions?: Omit<DatabaseSyncOptions, 'open'>;
}

export const KyselyPlugin = definePlugin({
  name: 'kysely',
  provides: [DatabaseService],
  apply(ctx, options: KyselyPluginOptions) {
    const kysely = new Kysely<FraqDatabase>({
      dialect: new SqliteDialect({
        database: new NodeSqliteDatabaseAdapter(new DatabaseSync(options.sqliteUrl, options.nodeSqliteOptions)),
      }),
    });
    ctx.provide(DatabaseService, new DatabaseService(kysely));
  },
  async start(ctx) {
    await ctx.resolve(DatabaseService).schemas.migrateToLatest();
  },
});

export * from './database';
export * from './schema';
export * from './types';
