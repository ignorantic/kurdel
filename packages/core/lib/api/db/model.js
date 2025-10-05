import { QueryBuilder } from '@kurdel/db';
export class Model {
    constructor(deps) {
        this.db = deps.db;
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
//# sourceMappingURL=model.js.map