import { IDatabase } from '@kurdel/db';
export declare class MigrationRegistry {
    private connection;
    private builder;
    constructor(connection: IDatabase);
    static create(connection: IDatabase): Promise<void>;
    get all(): Promise<string[]>;
    getBatch(batch: number): Promise<string[]>;
    get last(): Promise<number>;
    get next(): Promise<number>;
    add(name: string, batch: number): Promise<void>;
    remove(name: string): Promise<void>;
    private get;
    private getLastBatch;
    private getNextBatch;
    private existsMigrtionsTable;
    private createMigrationsTable;
}
