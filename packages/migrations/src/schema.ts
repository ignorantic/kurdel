import type { Database } from '@kurdel/db';
import { Blueprint, type IndexDefinition } from './blueprint.js';

type Configure = (table: Blueprint) => void;

export class Schema {
  constructor(private readonly connection: Database) {}

  async create(tableName: string, configure: Configure): Promise<void> {
    await this.createTable(tableName, configure, false);
  }

  async createIfNotExists(tableName: string, configure: Configure): Promise<void> {
    await this.createTable(tableName, configure, true);
  }

  private async createTable(
    tableName: string,
    configure: Configure,
    ifNotExists: boolean,
  ): Promise<void> {
    const blueprint = new Blueprint(this.connection.dialect);
    configure(blueprint);
    const definitions = blueprint.getColumnDefinitions();
    if (!definitions) throw new Error(`Table '${tableName}' must define at least one column`);

    await this.connection.run({
      sql: `CREATE TABLE ${ifNotExists ? 'IF NOT EXISTS ' : ''}${tableName} (${definitions});`,
      params: [],
    });

    for (const index of blueprint.getIndexes()) {
      await this.createIndex(tableName, index, ifNotExists);
    }
  }

  async drop(tableName: string): Promise<void> {
    await this.connection.run({ sql: `DROP TABLE ${tableName};`, params: [] });
  }

  async dropIfExists(tableName: string): Promise<void> {
    await this.connection.run({ sql: `DROP TABLE IF EXISTS ${tableName};`, params: [] });
  }

  private async createIndex(
    tableName: string,
    index: IndexDefinition,
    ifNotExists: boolean,
  ): Promise<void> {
    const name = index.name ?? `${tableName}_${index.columns.join('_')}_index`;
    const unique = index.unique ? 'UNIQUE ' : '';
    await this.connection.run({
      sql: [
        `CREATE ${unique}INDEX${ifNotExists ? ' IF NOT EXISTS' : ''} ${name}`,
        `ON ${tableName} (${index.columns.join(', ')});`,
      ].join(' '),
      params: [],
    });
  }
}
