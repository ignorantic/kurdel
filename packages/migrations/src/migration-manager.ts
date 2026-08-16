import EventEmitter from 'events';
import type { Database } from '@kurdel/db';
import { DBConnector } from '@kurdel/db';
import type { Migration } from './migration.js';
import { MigrationLoader } from './migration-loader.js';
import { MigrationLock } from './migration-lock.js';
import { MigrationRegistry } from './migration-registry.js';

export type MigrationStatus = {
  name: string;
  state: 'applied' | 'pending' | 'missing';
  batch?: number;
};

export class MigrationManager extends EventEmitter {
  private connection: Database;
  private loader: MigrationLoader;
  private registry: MigrationRegistry;
  private lock: MigrationLock;

  constructor(
    connection: Database,
    registry: MigrationRegistry,
    loader = new MigrationLoader(),
    lock = new MigrationLock(connection),
  ) {
    super();
    this.connection = connection;
    this.registry = registry;
    this.loader = loader;
    this.lock = lock;
  }

  public static async create(): Promise<MigrationManager> {
    const connection = await new DBConnector().run();
    try {
      const registry = await MigrationRegistry.create(connection);
      const lock = new MigrationLock(connection);
      return new MigrationManager(connection, registry, new MigrationLoader(), lock);
    } catch (error) {
      await connection.close();
      throw error;
    }
  }

  public async run() {
    return this.withLock(async () => {
      const migrations = await this.findMigrationsToRun();
      if (migrations.length === 0) this.emit('up:nothing');
      return this.runMigrations(migrations, await this.registry.next);
    });
  }

  public async rollback() {
    return this.withLock(async () => {
      const migrations = await this.findMigrationsToRollback(await this.registry.last);
      if (migrations.length === 0) this.emit('down:nothing');
      return this.rollbackMigrations(migrations);
    });
  }

  public async refresh() {
    return this.withLock(async () => {
      const migrationsToRollback = await this.findMigrationsToRollback();
      if (migrationsToRollback.length === 0) this.emit('down:nothing');
      const result = await this.rollbackMigrations(migrationsToRollback);
      if (!result) return false;

      const migrationsToRun = await this.findMigrationsToRun();
      if (migrationsToRun.length === 0) this.emit('up:nothing');
      return this.runMigrations(migrationsToRun);
    });
  }

  public async status(): Promise<MigrationStatus[]> {
    const [history, imported] = await Promise.all([this.registry.history, this.loader.load()]);
    const applied = new Map(history.map(record => [record.name, record.batch]));
    const importedNames = imported.map(migration => migration.name);
    return [
      ...importedNames.map(name => applied.has(name)
        ? { name, state: 'applied' as const, batch: applied.get(name)! }
        : { name, state: 'pending' as const }),
      ...history
        .filter(record => !importedNames.includes(record.name))
        .map(record => ({ name: record.name, state: 'missing' as const, batch: record.batch })),
    ];
  }

  public async close() {
    await this.connection.close();
  }

  private async withLock<T>(work: () => Promise<T>): Promise<T> {
    await this.lock.initialize();
    await this.lock.acquire();
    try {
      return await work();
    } finally {
      await this.lock.release();
    }
  }

  private async runMigrations(migrations: Migration[], batch: number = 1) {
    for (const migration of migrations) {
      const { name } = migration.constructor;
      try {
        await migration.up();
        await this.registry.add(name, batch);
        this.emit('up:success', name);
        continue;
      } catch (error) {
        this.emit('up:failure', name, error);
        return false;
      }
    }
    return true;
  }

  private async rollbackMigrations(migrations: Migration[]) {
    for (const migration of migrations) {
      const { name } = migration.constructor;
      try {
        await migration.down();
        await this.registry.remove(name);
        this.emit('down:success', name);
        continue;
      } catch (error) {
        this.emit('down:failure', name, error);
        return false;
      }
    }
    return true;
  }

  private async findMigrationsToRun() {
    const [appliedMigrations, importedMigrations] = await Promise.all([
      this.registry.all,
      this.loader.load(),
    ]);
    return importedMigrations
      .filter(MigrationClass => !appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));
  }

  private async findMigrationsToRollback(batch?: number) {
    const [appliedMigrations, importedMigrations] = await Promise.all([
      batch ? this.registry.getBatch(batch) : this.registry.all,
      this.loader.load(),
    ]);
    importedMigrations.reverse();
    return importedMigrations
      .filter(MigrationClass => appliedMigrations.includes(MigrationClass.name))
      .map(MigrationClass => new MigrationClass(this.connection));
  }
}
