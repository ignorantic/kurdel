export type DatabaseQuery = {
    sql: string;
    params: any[];
};
export interface IDatabase {
    get(query: DatabaseQuery): Promise<any>;
    all(query: DatabaseQuery): Promise<any>;
    run(query: DatabaseQuery): Promise<void>;
    close(): Promise<void>;
}
export interface IQueryBuilder {
    insert(table: string, data: Record<string, any>): IQueryBuilder;
    select(fields: string | string[]): IQueryBuilder;
    from(table: string): IQueryBuilder;
    where(condition: string, params?: any[]): IQueryBuilder;
    build(): DatabaseQuery;
}
