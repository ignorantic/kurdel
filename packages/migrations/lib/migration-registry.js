import { QueryBuilder } from '@kurdel/db';
import { Schema } from './schema.js';
export class MigrationRegistry {
    connection;
    builder;
    constructor(connection) {
        this.connection = connection;
        this.builder = new QueryBuilder();
    }
    static async create(connection) {
        const registry = new MigrationRegistry(connection);
        const exists = await registry.existsMigrtionsTable();
        if (!exists) {
            registry.createMigrationsTable();
        }
    }
    get all() {
        const query = this.builder.select('*').from('migrations').build();
        return this.get(query);
    }
    getBatch(batch) {
        const query = this.builder.select('*').from('migrations').where('batch = ?', [batch]).build();
        return this.get(query);
    }
    get last() {
        return this.getLastBatch();
    }
    get next() {
        return this.getNextBatch();
    }
    async add(name, batch) {
        const query = this.builder.insert('migrations', { name, batch }).build();
        await this.connection.run(query);
    }
    async remove(name) {
        const query = this.builder
            .delete()
            .from('migrations')
            .where('name = ?', [name])
            .build();
        await this.connection.run(query);
    }
    async get(query) {
        const migrations = await this.connection.all(query);
        return migrations.map(migration => migration.name);
    }
    async getLastBatch() {
        const maxBatchQuery = this.builder
            .select('batch', { fn: 'MAX', as: 'maxBatch' })
            .from('migrations')
            .build();
        const { maxBatch } = await this.connection.get(maxBatchQuery);
        return maxBatch ?? 0;
    }
    async getNextBatch() {
        return (await this.getLastBatch()) + 1;
    }
    async existsMigrtionsTable() {
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
}
