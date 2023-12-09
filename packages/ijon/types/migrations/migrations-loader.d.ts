import { IDatabase } from '../db/interfaces.js';
export declare class MigrationsLoader {
    private connection;
    private builder;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationsLoader>;
    up(): Promise<void>;
    down(): Promise<void>;
    getLastBatchNumber(): Promise<number>;
    existMigrationsTable(): Promise<Boolean>;
    createMigrationsTable(): Promise<void>;
    selectAppliedMigrations(batch?: number): Promise<string[]>;
    private load;
}
