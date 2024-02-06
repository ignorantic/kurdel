import EventEmitter from 'events';
import { DBConnector } from '@kurdel/db';
import { MigrationLoader } from './migration-loader.js';
import { MigrationRegistry } from './migration-registry.js';
export class MigrationManager extends EventEmitter {
    connection;
    loader;
    registry;
    constructor(connection, registry) {
        super();
        this.connection = connection;
        this.registry = registry;
        this.loader = new MigrationLoader();
    }
    static async create() {
        const connection = await (new DBConnector()).run();
        const registry = await MigrationRegistry.create(connection);
        return new MigrationManager(connection, registry);
    }
    async run() {
        const migrations = await this.findMigrationsToRun();
        if (migrations.length === 0) {
            this.emit('up:nothing');
        }
        await this.runMigrations(migrations, await this.registry.next);
    }
    async rollback() {
        const migrations = await this.findMigrationsToRollback(await this.registry.last);
        if (migrations.length === 0) {
            this.emit('down:nothing');
        }
        await this.rollbackMigrations(migrations);
    }
    async refresh() {
        const migrationsToRollback = await this.findMigrationsToRollback();
        if (migrationsToRollback.length === 0) {
            this.emit('down:nothing');
        }
        const result = await this.rollbackMigrations(migrationsToRollback);
        if (!result) {
            return;
        }
        const migrationsToRun = await this.findMigrationsToRun();
        if (migrationsToRun.length === 0) {
            this.emit('up:nothing');
        }
        await this.runMigrations(migrationsToRun);
    }
    async close() {
        this.connection.close();
    }
    async runMigrations(migrations, batch = 1) {
        for (const migration of migrations) {
            const { name } = migration.constructor;
            try {
                await migration.up();
                await this.registry.add(name, batch);
                this.emit('up:success', name);
                continue;
            }
            catch (error) {
                this.emit('up:failure', name, error);
                return false;
            }
        }
        return true;
    }
    async rollbackMigrations(migrations) {
        for (const migration of migrations) {
            const { name } = migration.constructor;
            try {
                await migration.down();
                await this.registry.remove(name);
                this.emit('down:success', name);
                continue;
            }
            catch (error) {
                this.emit('down:failure', name, error);
                return false;
            }
        }
        return true;
    }
    async findMigrationsToRun() {
        const [appliedMigrations, importedMigrations] = await Promise.all([
            this.registry.all,
            this.loader.load(),
        ]);
        return importedMigrations
            .filter(MigrationClass => !appliedMigrations.includes(MigrationClass.name))
            .map(MigrationClass => new MigrationClass(this.connection));
    }
    async findMigrationsToRollback(batch) {
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
