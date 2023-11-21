import { DatabaseQuery, IQueryBuilder } from './interfaces.js';

export class QueryBuilder implements IQueryBuilder {
  private sql: string = '';
  private params: any[] = [];

  select(fields: string | string[]): QueryBuilder {
    this.sql = `SELECT ${Array.isArray(fields) ? fields.join(', ') : fields} `;
    this.params = [];
    return this;
  }

  insert(table: string, data: Record<string, any>): QueryBuilder {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');

    this.sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) `;
    this.params = values;
    return this;
  }

  from(table: string): QueryBuilder {
    this.sql += `FROM ${table} `;
    return this;
  }

  where(condition: string, params?: any[]): QueryBuilder {
    this.sql += `WHERE ${condition} `;
    if (params) {
      this.params.push(...params);
    }
    return this;
  }

  build(): DatabaseQuery {
    return { sql: this.sql.trim(), params: this.params };
  }
}
