import type { SqliteDatabase, SqliteStatement } from 'kysely';

import type { DatabaseSync, StatementResultingChanges, StatementSync } from 'node:sqlite';

function toMutableParameters(parameters: readonly unknown[]): unknown[] {
  return [...parameters];
}

export class NodeSqliteStatementAdapter implements SqliteStatement {
  constructor(private readonly statement: StatementSync) {}

  get reader(): boolean {
    return this.statement.columns().length > 0;
  }

  all(parameters: readonly unknown[]): unknown[] {
    // @ts-expect-error
    return this.statement.all(...toMutableParameters(parameters));
  }

  iterate(parameters: readonly unknown[]): IterableIterator<unknown> {
    // @ts-expect-error
    return this.statement.iterate(...toMutableParameters(parameters));
  }

  run(parameters: readonly unknown[]): StatementResultingChanges {
    // @ts-expect-error
    return this.statement.run(...toMutableParameters(parameters));
  }
}

export class NodeSqliteDatabaseAdapter implements SqliteDatabase {
  constructor(private readonly database: DatabaseSync) {}

  close(): void {
    this.database.close();
  }

  prepare(sql: string): NodeSqliteStatementAdapter {
    return new NodeSqliteStatementAdapter(this.database.prepare(sql));
  }
}
