import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { MIGRATIONS_DIR } from '../consts.js';
import { DBConnector } from '../db/db-connector.js';
import { QueryBuilder } from '../db/query-builder.js';
import { Schema } from './schema.js';
const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);
export class MigrationLoader extends EventEmitter {
    connection;
    builder;
    constructor(connection) {
        super();
        this.connection = connection;
        this.builder = new QueryBuilder();
    }
    static async create() {
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
    async startGenerator(generetor) {
        const next = await generetor.next();
        if (next.value === false) {
            return false;
        }
        if (!next.done) {
            next.value;
            await this.startGenerator(generetor);
        }
        else {
            return true;
        }
    }
    async *getRunGenerator(migrations, batch = 1) {
        for (const migration of migrations) {
            try {
                await migration.up();
                const insertQuery = this.builder.insert('migrations', {
                    name: migration.constructor.name,
                    batch,
                }).build();
                await this.connection.run(insertQuery);
                this.emit('up:success', migration.constructor.name);
                yield true;
            }
            catch (error) {
                this.emit('up:failure', migration.constructor.name, error);
                return false;
            }
        }
    }
    async *getRollbackGenerator(migrations) {
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
            }
            catch (error) {
                this.emit('down:failure', migration.constructor.name, error);
                return false;
            }
        }
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
    async findMigrationsToRollback(batch) {
        const [appliedMigrations, importedMigrations] = await Promise.all([
            this.selectAppliedMigrations(batch),
            this.load(),
        ]);
        importedMigrations.reverse();
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
