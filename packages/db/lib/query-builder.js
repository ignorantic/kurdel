export class QueryBuilder {
    constructor() {
        this.sql = '';
        this.params = [];
    }
    select(fields, options = {}) {
        if (options.fn) {
            this.sql = `SELECT ${options.fn}(${fields}) `;
        }
        else {
            this.sql = `SELECT ${Array.isArray(fields) ? fields.join(', ') : fields} `;
        }
        if (options.as) {
            this.sql = this.sql + `AS ${options.as} `;
        }
        this.params = [];
        return this;
    }
    insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        this.sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) `;
        this.params = values;
        return this;
    }
    delete() {
        this.sql = `DELETE `;
        return this;
    }
    from(table) {
        this.sql += `FROM ${table} `;
        return this;
    }
    where(condition, params) {
        this.sql += `WHERE ${condition} `;
        if (params) {
            this.params.push(...params);
        }
        return this;
    }
    build() {
        const result = { sql: this.sql.trim(), params: [...this.params] };
        this.sql = '';
        this.params = [];
        return result;
    }
}
//# sourceMappingURL=query-builder.js.map