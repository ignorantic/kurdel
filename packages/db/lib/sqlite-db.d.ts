import type { DatabaseQuery, IDatabase } from './interfaces.js';
export declare class SQLiteDB implements IDatabase {
    private db;
    constructor(path: string);
    get({ sql, params }: DatabaseQuery): Promise<any>;
    all({ sql, params }: DatabaseQuery): Promise<any>;
    run({ sql, params }: DatabaseQuery): Promise<void>;
    close(): Promise<void>;
}
