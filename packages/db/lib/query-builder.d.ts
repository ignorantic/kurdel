import type { DatabaseQuery, IQueryBuilder } from './interfaces.js';
type SelectOptions = {
    fn?: 'MAX' | 'MIN' | 'COUNT';
    as?: string;
};
export declare class QueryBuilder implements IQueryBuilder {
    private sql;
    private params;
    select(fields: string | string[], options?: SelectOptions): QueryBuilder;
    insert(table: string, data: Record<string, any>): QueryBuilder;
    delete(): QueryBuilder;
    from(table: string): QueryBuilder;
    where(condition: string, params?: any[]): QueryBuilder;
    build(): DatabaseQuery;
}
export {};
