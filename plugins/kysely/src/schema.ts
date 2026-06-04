import type { Kysely } from 'kysely';
import type { Migration } from 'kysely/migration';

const MIGRATION_TABLE = 'fraq_schema_migrations';

export interface SchemaDefinition {
  name: string;
  migrations: Record<string, Migration>;
}

export interface SchemaStatus {
  name: string;
  applied: readonly string[];
  pending: readonly string[];
}

export class SchemaRegistry {
  private readonly schemas = new Map<string, SchemaDefinition>();

  constructor(
    // biome-ignore lint/suspicious/noExplicitAny: Suggested usage from Kysely's official documentation.
    private readonly kysely: Kysely<any>,
  ) {}

  register(schema: SchemaDefinition): void {
    if (schema.name.length === 0) {
      throw new Error('Schema name cannot be empty.');
    }
    if (this.schemas.has(schema.name)) {
      throw new Error(`Schema ${schema.name} has already been registered.`);
    }
    this.schemas.set(schema.name, {
      name: schema.name,
      migrations: { ...schema.migrations },
    });
  }

  get(name: string): SchemaDefinition | undefined {
    return this.schemas.get(name);
  }

  list(): readonly SchemaDefinition[] {
    return [...this.schemas.values()];
  }

  async migrateToLatest(): Promise<void> {
    await this.ensureMigrationTable();

    for (const schema of this.schemas.values()) {
      const applied = new Set(await this.getAppliedMigrations(schema.name));
      for (const [migrationName, migration] of Object.entries(schema.migrations)) {
        if (applied.has(migrationName)) {
          continue;
        }
        await this.kysely.transaction().execute(async (trx) => {
          await migration.up(trx);
          await trx
            .insertInto(MIGRATION_TABLE)
            .values({
              schema_name: schema.name,
              migration_name: migrationName,
              migrated_at: new Date().toISOString(),
            })
            .execute();
        });
      }
    }
  }

  async getStatus(schemaName?: string): Promise<readonly SchemaStatus[]> {
    await this.ensureMigrationTable();

    const schemas = schemaName ? [this.requireSchema(schemaName)] : [...this.schemas.values()];
    const status: SchemaStatus[] = [];

    for (const schema of schemas) {
      const appliedSet = new Set(await this.getAppliedMigrations(schema.name));
      const migrationNames = Object.keys(schema.migrations);
      const applied = migrationNames.filter((migrationName) => appliedSet.has(migrationName));
      const pending = migrationNames.filter((migrationName) => !appliedSet.has(migrationName));
      status.push({
        name: schema.name,
        applied,
        pending,
      });
    }

    return status;
  }

  private async ensureMigrationTable(): Promise<void> {
    await this.kysely.schema
      .createTable(MIGRATION_TABLE)
      .ifNotExists()
      .addColumn('schema_name', 'text', (column) => column.notNull())
      .addColumn('migration_name', 'text', (column) => column.notNull())
      .addColumn('migrated_at', 'text', (column) => column.notNull())
      .addPrimaryKeyConstraint(`${MIGRATION_TABLE}_pk`, ['schema_name', 'migration_name'])
      .execute();
  }

  private async getAppliedMigrations(schemaName: string): Promise<string[]> {
    const rows = await this.kysely
      .selectFrom(MIGRATION_TABLE)
      .select('migration_name')
      .where('schema_name', '=', schemaName)
      .execute();

    return rows.map((row) => row.migration_name);
  }

  private requireSchema(name: string): SchemaDefinition {
    const schema = this.schemas.get(name);
    if (!schema) {
      throw new Error(`Schema ${name} has not been registered.`);
    }
    return schema;
  }
}
