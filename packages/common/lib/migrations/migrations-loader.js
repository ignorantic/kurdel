import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { MIGRATIONS_DIR } from '../consts.js';
import { DBConnector } from '../db/db-connector.js';
import { QueryBuilder } from '../db/query-builder.js';
import { Schema } from './schema.js';
const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);
export class MigrationsLoader extends EventEmitter {
    connection;
    builder;
    constructor(connection) {
        super();
        this.connection = connection;
        this.builder = new QueryBuilder();
    }
    static async create() {
        const connection = await (new DBConnector()).run();
        return new MigrationsLoader(connection);
    }
    async up() {
        const migrations = await this.findMigrationsToRun();
        if (migrations.length === 0) {
            this.emit('up:nothing');
            return;
        }
        const lastBatchNumber = await this.getLastBatchNumber();
        const batchNumber = lastBatchNumber + 1;
        await Promise.all(migrations.map(async (migration) => {
            await migration.up();
            const insertQuery = this.builder.insert('migrations', {
                name: migration.constructor.name,
                batch: batchNumber,
            }).build();
            await this.connection.run(insertQuery);
            this.emit('up:success', migration.constructor.name);
            return Promise.resolve();
        }));
    }
    async down() {
        const migrations = await this.findMigrationsToRollback();
        await Promise.all(migrations.map(async (migration) => {
            migration.down();
            const deleteQuery = this.builder
                .delete()
                .from('migrations')
                .where('name = ?', [migration.constructor.name])
                .build();
            await this.connection.run(deleteQuery);
            this.emit('down:success', migration.constructor.name);
            return Promise.resolve();
        }));
    }
    async close() {
        this.connection.close();
    }
    async findMigrationsToRun() {
        const [appliedMigrations, importedMigrations] = await Promise.all([
            this.selectAppliedMigrations(),
            this.load(),
        ]);
        return importedMigrations
            .filter(MigrationClass => !appliedMigrations.includes(MigrationClass.name))
            .map(MigrationClass => new MigrationClass(this.connection));
    }
    async findMigrationsToRollback() {
        const lastBatchNumber = await this.getLastBatchNumber();
        const [appliedMigrations, importedMigrations] = await Promise.all([
            this.selectAppliedMigrations(lastBatchNumber),
            this.load(),
        ]);
        return importedMigrations
            .filter(MigrationClass => appliedMigrations.includes(MigrationClass.name))
            .map(MigrationClass => new MigrationClass(this.connection));
    }
    async getLastBatchNumber() {
        const maxBatchQuery = this.builder
            .select('batch', { fn: 'MAX', as: 'maxBatch' })
            .from('migrations')
            .build();
        const { maxBatch } = await this.connection.get(maxBatchQuery);
        return maxBatch ?? 0;
    }
    async existMigrationsTable() {
        const selectCountQuery = this.builder
            .select('batch', { fn: 'COUNT' })
            .from('migrations')
            .build();
        try {
            await this.connection.get(selectCountQuery);
            return true;
        }
        catch {
            return false;
        }
    }
    async createMigrationsTable() {
        const schema = new Schema(this.connection);
        await schema.create('migrations', (table) => {
            table.integer('id');
            table.primaryKey('id');
            table.string('name');
            table.integer('batch');
        });
    }
    async selectAppliedMigrations(batch) {
        if (await this.existMigrationsTable()) {
            const selectMigrationsQuery = batch
                ? this.builder.select('*').from('migrations').where('batch = ?', [batch]).build()
                : this.builder.select('*').from('migrations').build();
            const migrations = await this.connection.all(selectMigrationsQuery);
            return migrations.map(migration => migration.name);
        }
        else {
            this.createMigrationsTable();
            return [];
        }
    }
    async load() {
        return Promise.all(fs.readdirSync(migrationsDirectory).map(async (file) => {
            const { default: MigrationClass } = await import(path.join(migrationsDirectory, file));
            return MigrationClass;
        }));
    }
}
