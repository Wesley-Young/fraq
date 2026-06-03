import { definePlugin } from '@fraqjs/fraq';
import { type Dialect, Kysely } from 'kysely';

import { DatabaseService } from './service/database';
import { SchemaService } from './service/schema';
import type { FraqDatabase } from './types';

export interface KyselyPluginOptions {
  dialect: Dialect;
}

export const KyselyPlugin = definePlugin({
  name: 'kysely',
  provides: [DatabaseService, SchemaService],
  apply(ctx, options: KyselyPluginOptions) {
    const kysely = new Kysely<FraqDatabase>({
      dialect: options.dialect,
    });
    ctx.provide(DatabaseService, new DatabaseService(kysely));
    ctx.provide(SchemaService, new SchemaService());
  },
});

export * from './node-sqlite-adapter';
export * from './service/database';
export * from './service/schema';
export * from './types';
