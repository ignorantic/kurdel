import type { IDatabase } from '@kurdel/db';
import { Blueprint, type IndexDefinition } from './blueprint.js';

type Configure = (table: Blueprint) => void;

export class Schema {
  constructor(private readonly connection: IDatabase) {}

  async create(tableName: string, configure: Configure): Promise<void> {
    const blueprint = new Blueprint();
    configure(blueprint);
    const definitions = blueprint.getColumnDefinitions();
    if (!definitions) throw new Error(`Table '${tableName}' must define at least one column`);

    await this.connection.run({
      sql: `CREATE TABLE ${tableName} (${definitions});`,
      params: [],
    });

    for (const index of blueprint.getIndexes()) {
      await this.createIndex(tableName, index);
    }
  }

  async drop(tableName: string): Promise<void> {
    await this.connection.run({ sql: `DROP TABLE ${tableName};`, params: [] });
  }

  async dropIfExists(tableName: string): Promise<void> {
    await this.connection.run({ sql: `DROP TABLE IF EXISTS ${tableName};`, params: [] });
  }

  private async createIndex(tableName: string, index: IndexDefinition): Promise<void> {
    const name = index.name ?? `${tableName}_${index.columns.join('_')}_index`;
    const unique = index.unique ? 'UNIQUE ' : '';
    await this.connection.run({
      sql: `CREATE ${unique}INDEX ${name} ON ${tableName} (${index.columns.join(', ')});`,
      params: [],
    });
  }
}
