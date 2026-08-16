export interface DatabaseConfig {
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

export const Database = Symbol('Database');
export interface DatabaseSession {
  get(query: DatabaseQuery): Promise<any>;
  all(query: DatabaseQuery): Promise<any>;
  run(query: DatabaseQuery): Promise<void>;
}

export interface Database extends DatabaseSession {
  readonly dialect: DatabaseDialect;
  /**
   * Runs work atomically on an isolated database session.
   *
   * Queries inside the callback must use the supplied transaction session.
   * Resolves with the callback result after commit and rolls back on failure.
   */
  transaction<T>(work: (transaction: DatabaseSession) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface QueryBuilderContract {
  insert(table: string, data: Record<string, any>): QueryBuilderContract;
  select(fields: string | string[]): QueryBuilderContract;
  from(table: string): QueryBuilderContract;
  where(condition: string, params?: any[]): QueryBuilderContract;
  build(): DatabaseQuery;
}
