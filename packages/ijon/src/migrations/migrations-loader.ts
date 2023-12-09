import fs from 'fs';
import path from 'path';
import { Newable } from '../types.js';
import { MIGRATIONS_DIR } from '../consts.js';
import { IDatabase } from '../db/interfaces.js';
import { DBConnector } from '../db/db-connector.js';
import { QueryBuilder } from '../db/query-builder.js';
import { Migration } from './migration.js';
import { Schema } from './schema.js';

type MigrationRecord = { id: number, name: string, batch: number };

const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);

export class MigrationsLoader {
  private connection: IDatabase;
  private builder: QueryBuilder;

  constructor(connection: IDatabase) {
    this.connection = connection;
    this.builder = new QueryBuilder();
  }

  static async create(): Promise<MigrationsLoader> {
    const connection = await (new DBConnector()).run();
    return new MigrationsLoader(connection);
  }

  async up() {
    const appliedMigrations = await this.selectAppliedMigrations();
    const importedMigrations = await this.load();
    const migrations = importedMigrations
      .filter(MigrationClass => !appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));

    const lastBatchNumber = await this.getLastBatchNumber();
    const batchNumber = lastBatchNumber + 1;

    migrations.forEach(async migration => {
      await migration.up();
      const insertQuery = this.builder.insert('migrations', {
        name: migration.constructor.name,
        batch: batchNumber,
      }).build();
      await this.connection.run(insertQuery)
    });
  }

  async down() {
    const lastBatchNumber = await this.getLastBatchNumber();
    const appliedMigrations = await this.selectAppliedMigrations(lastBatchNumber);
    const importedMigrations = await this.load();
    const migrations = importedMigrations
      .filter(MigrationClass => appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));

    migrations.forEach(async migration => {
      migration.down();
      const deleteQuery = this.builder
        .delete()
        .from('migrations')
        .where('name = ?', [migration.constructor.name])
        .build();
      await this.connection.run(deleteQuery);
    });
  }

  async getLastBatchNumber(): Promise<number> {
    const maxBatchQuery = this.builder
      .select('batch', { fn: 'MAX', as: 'maxBatch' })
      .from('migrations')
      .build();
    const { maxBatch } = await this.connection.get(maxBatchQuery);
    return maxBatch ?? 0;
  }

  async existMigrationsTable(): Promise<Boolean> {
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

  async createMigrationsTable(): Promise<void> {
    const schema = new Schema(this.connection);
    await schema.create('migrations', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
      table.integer('batch');
    });
  }

  async selectAppliedMigrations(batch?: number): Promise<string[]> {
    if (await this.existMigrationsTable()) {
      const selectMigrationsQuery = batch
        ? this.builder.select('*').from('migrations').where('batch = ?', [batch]).build()
        : this.builder.select('*').from('migrations').build();
      const migrations = await this.connection.all(selectMigrationsQuery) as MigrationRecord[];
      return migrations.map(migration => migration.name);
    } else {
      this.createMigrationsTable();
      return [];
    }
  }

  private async load(): Promise<Newable<Migration>[]> {
    return Promise.all(
      fs.readdirSync(migrationsDirectory).map(async file => {
        const { default: MigrationClass } = await import(path.join(migrationsDirectory, file));
        return MigrationClass;
      })
    );
  }
}
