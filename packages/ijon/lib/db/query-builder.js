export class QueryBuilder {
    sql = '';
    params = [];
    select(fields) {
        this.sql = `SELECT ${Array.isArray(fields) ? fields.join(', ') : fields} `;
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
        return { sql: this.sql.trim(), params: this.params };
    }
}
