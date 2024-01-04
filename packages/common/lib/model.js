import { QueryBuilder } from './db/query-builder.js';
export class Model {
    db;
    builder;
    constructor(db) {
        this.db = db;
        this.builder = new QueryBuilder();
    }
    async create(data) {
        return this.db.run(this.builder.insert(this.table, data).build());
    }
    async find(field, values) {
        return this.db.get(this.builder.select('*').from(this.table).where(`${field} = ?`, values).build());
    }
    async findAll() {
        return this.db.all(this.builder.select('*').from(this.table).build());
    }
}
