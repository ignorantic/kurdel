import type { IDatabase, DatabaseQuery} from '@kurdel/db';
import { QueryBuilder } from '@kurdel/db';
import { Schema } from './schema.js';

type MigrationRecord = {
  id: number;
  name: string;
  batch: number;
};

export class MigrationRegistry {
  private connection: IDatabase;
  private builder: QueryBuilder;

  constructor(connection: IDatabase) {
    this.connection = connection;
    this.builder = new QueryBuilder();
  }

  public static async create(connection: IDatabase) {
    const registry = new MigrationRegistry(connection);
    const exists = await registry.existsMigrtionsTable();
    if (!exists) {
      await registry.createMigrationsTable();
    }
    return registry;
  }

  public get all(): Promise<string[]> {
    const query = this.builder.select('*').from('migrations').build();
    return this.get(query);
  }

  public getBatch(batch: number) {
    const query = this.builder.select('*').from('migrations').where('batch = ?', [batch]).build();
    return this.get(query);
  }

  public get last(): Promise<number> {
    return this.getLastBatch();
  }

  public get next(): Promise<number> {
    return this.getNextBatch();
  }

  public async add(name: string, batch: number) {
    const query = this.builder.insert('migrations', { name, batch }).build();
    await this.connection.run(query);
  }

  public async remove(name: string) {
    const query = this.builder.delete().from('migrations').where('name = ?', [name]).build();
    await this.connection.run(query);
  }

  private async get(query: DatabaseQuery): Promise<string[]> {
    const migrations = (await this.connection.all(query)) as MigrationRecord[];
    return migrations.map(migration => migration.name);
  }

  private async getLastBatch(): Promise<number> {
    const maxBatchQuery = this.builder
      .select('batch', { fn: 'MAX', as: 'maxBatch' })
      .from('migrations')
      .build();
    const { maxBatch } = await this.connection.get(maxBatchQuery);
    return maxBatch ?? 0;
  }

  private async getNextBatch(): Promise<number> {
    return (await this.getLastBatch()) + 1;
  }

  private async existsMigrtionsTable(): Promise<boolean> {
    const selectCountQuery = this.builder
      .select('batch', { fn: 'COUNT' })
      .from('migrations')
      .build();
    try {
      await this.connection.get(selectCountQuery);
      return true;
    } catch {
      return false;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const schema = new Schema(this.connection);
    await schema.create('migrations', table => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
      table.integer('batch');
    });
  }
}
