import { IDatabase } from '@kurdel/db';
import { Blueprint } from './blueprint.js';

type Configure = (table: Blueprint) => void;

export class Schema {
  private connection: IDatabase;

  constructor(connection: IDatabase) {
    this.connection = connection;
  }

  async create(tableName: string, configure: Configure): Promise<void> {
    const blueprint = new Blueprint();
    configure(blueprint);
    const columnDefinitions = blueprint.getColumnDefinitions();
    const sql = `CREATE TABLE ${tableName} (${columnDefinitions});`;
    await this.connection.run({ sql, params: [] });
  }

  async drop(tableName: string): Promise<void> {
    const sql = `DROP TABLE ${tableName};`;
    this.connection.run({ sql, params: [] });
  }
}
