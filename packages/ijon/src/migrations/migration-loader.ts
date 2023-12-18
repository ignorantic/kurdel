import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { Newable } from '../types.js';
import { MIGRATIONS_DIR } from '../consts.js';
import { IDatabase } from '../db/interfaces.js';
import { DBConnector } from '../db/db-connector.js';
import { QueryBuilder } from '../db/query-builder.js';
import { Migration } from './migration.js';
import { Schema } from './schema.js';

type MigrationRecord = {
  id: number;
  name: string;
  batch: number;
};

const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);

export class MigrationLoader extends EventEmitter {
  private connection: IDatabase;
  private builder: QueryBuilder;

  constructor(connection: IDatabase) {
    super();
    this.connection = connection;
    this.builder = new QueryBuilder();
  }

  static async create(): Promise<MigrationLoader> {
    const connection = await (new DBConnector()).run();
    return new MigrationLoader(connection);
  }

  async run() {
    const migrations = await this.findMigrationsToRun();
    if (migrations.length === 0) {
      this.emit('up:nothing');
    }

    const lastBatchNumber = await this.getLastBatchNumber();
    const batchNumber = lastBatchNumber + 1;
    await this.startGenerator(this.getRunGenerator(migrations, batchNumber));
  }

  async rollback() {
    const lastBatchNumber = await this.getLastBatchNumber();
    const migrations = await this.findMigrationsToRollback(lastBatchNumber);
    if (migrations.length === 0) {
      this.emit('down:nothing');
    }

    await this.startGenerator(this.getRollbackGenerator(migrations));
  }

  async refresh() {
    const migrationsToRollback = await this.findMigrationsToRollback();
    if (migrationsToRollback.length === 0) {
      this.emit('down:nothing');
    }
    const result = await this.startGenerator(this.getRollbackGenerator(migrationsToRollback));

    if (result === false) {
      return;
    }

    const migrationsToRun = await this.findMigrationsToRun();
    if (migrationsToRun.length === 0) {
      this.emit('up:nothing');
    }
    await this.startGenerator(this.getRunGenerator(migrationsToRun));
  }

  async close() {
    this.connection.close();
  }

  private async startGenerator(generetor: AsyncGenerator<boolean>) {
    const next = await generetor.next();
    if (next.value === false) {
      return false;
    }
    if (!next.done) {
      next.value;
      await this.startGenerator(generetor);
    } else {
      return true;
    }
  }

  private async *getRunGenerator(migrations: Migration[], batch: number = 1) {
    for (const migration of migrations) {
      try {
        await migration.up();
        const insertQuery = this.builder.insert('migrations', {
          name: migration.constructor.name,
          batch,
        }).build();
        await this.connection.run(insertQuery)
        this.emit('up:success', migration.constructor.name);
        yield true;
      } catch(error) {
        this.emit('up:failure', migration.constructor.name, error);
        return false;
      }
    } 
  }

  private async *getRollbackGenerator(migrations: Migration[]) {
    for (const migration of migrations) {
      try {
        await migration.down();
        const deleteQuery = this.builder
          .delete()
          .from('migrations')
          .where('name = ?', [migration.constructor.name])
          .build();
        await this.connection.run(deleteQuery);
        this.emit('down:success', migration.constructor.name);
        yield true;
      } catch(error) {
        this.emit('down:failure', migration.constructor.name, error);
        return false;
      }
    } 
  }

  private async findMigrationsToRun() {
    const [appliedMigrations, importedMigrations] = await Promise.all([
      this.selectAppliedMigrations(),
      this.load(),
    ]);
    return importedMigrations
      .filter(MigrationClass => !appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));
  }

  private async findMigrationsToRollback(batch?: number) {
    const [appliedMigrations, importedMigrations] = await Promise.all([
      this.selectAppliedMigrations(batch),
      this.load(),
    ]);
    importedMigrations.reverse();
    return importedMigrations
      .filter(MigrationClass => appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));
  }

  private async getLastBatchNumber(): Promise<number> {
    const maxBatchQuery = this.builder
      .select('batch', { fn: 'MAX', as: 'maxBatch' })
      .from('migrations')
      .build();
    const { maxBatch } = await this.connection.get(maxBatchQuery);
    return maxBatch ?? 0;
  }

  private async existMigrationsTable(): Promise<Boolean> {
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
    await schema.create('migrations', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
      table.integer('batch');
    });
  }

  private async selectAppliedMigrations(batch?: number): Promise<string[]> {
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
