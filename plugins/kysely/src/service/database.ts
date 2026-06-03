import type { Disposable } from '@fraqjs/fraq';
import type { Kysely } from 'kysely';

import type { FraqDatabase } from '../types';

export class DatabaseService implements Disposable {
  constructor(readonly kysely: Kysely<FraqDatabase>) {}

  async dispose() {
    await this.kysely.destroy();
  }
}
