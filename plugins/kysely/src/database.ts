import type { Disposable } from '@fraqjs/fraq';
import type { Kysely } from 'kysely';

import { SchemaRegistry } from './schema';
import type { FraqDatabase } from './types';

export class DatabaseService implements Disposable {
  readonly schemas: SchemaRegistry;

  constructor(readonly kysely: Kysely<FraqDatabase>) {
    this.schemas = new SchemaRegistry(kysely);
  }

  async dispose() {
    await this.kysely.destroy();
  }
}
