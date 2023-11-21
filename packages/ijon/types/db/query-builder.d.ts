import { DatabaseQuery, IQueryBuilder } from './interfaces.js';
export declare class QueryBuilder implements IQueryBuilder {
    private sql;
    private params;
    select(fields: string | string[]): QueryBuilder;
    insert(table: string, data: Record<string, any>): QueryBuilder;
    from(table: string): QueryBuilder;
    where(condition: string, params?: any[]): QueryBuilder;
    build(): DatabaseQuery;
}
