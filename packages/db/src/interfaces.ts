export interface IDatabaseConfig {
  type: string;
  host?: string;
  filename?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionString?: string;
  ssl?: boolean | {
    rejectUnauthorized?: boolean;
    ca?: string;
  };
}

export type DatabaseDialect = 'sqlite' | 'postgres';

export type DatabaseQuery = {
  sql: string;
  params: any[];
};

export const IDatabase = Symbol('IDatabase');
export interface IDatabaseSession {
  get(query: DatabaseQuery): Promise<any>;
  all(query: DatabaseQuery): Promise<any>;
  run(query: DatabaseQuery): Promise<void>;
}

export interface IDatabase extends IDatabaseSession {
  readonly dialect: DatabaseDialect;
  /**
   * Runs work atomically on an isolated database session.
   *
   * Queries inside the callback must use the supplied transaction session.
   * Resolves with the callback result after commit and rolls back on failure.
   */
  transaction<T>(work: (transaction: IDatabaseSession) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface IQueryBuilder {
  insert(table: string, data: Record<string, any>): IQueryBuilder;
  select(fields: string | string[]): IQueryBuilder;
  from(table: string): IQueryBuilder;
  where(condition: string, params?: any[]): IQueryBuilder;
  build(): DatabaseQuery;
}
