import type { DatabaseQuery, IQueryBuilder } from './interfaces.js';

type SelectOptions = {
  fn?: 'MAX' | 'MIN' | 'COUNT';
  as?: string;
};

export class QueryBuilder implements IQueryBuilder {
  private sql: string = '';
  private params: any[] = [];

  select(fields: string | string[], options: SelectOptions = {}): QueryBuilder {
    if (options.fn) {
      this.sql = `SELECT ${options.fn}(${fields}) `;
    } else {
      this.sql = `SELECT ${Array.isArray(fields) ? fields.join(', ') : fields} `;
    }
    if (options.as) {
      this.sql = this.sql + `AS ${options.as} `;
    }
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

  delete(): QueryBuilder {
    this.sql = `DELETE `;
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
    const result = { sql: this.sql.trim(), params: [...this.params] };
    this.sql = '';
    this.params = [];
    return result;
  }
}
