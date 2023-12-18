/// <reference types="node" resolution-mode="require"/>
import EventEmitter from 'events';
import { IDatabase } from '../db/interfaces.js';
export declare class MigrationLoader extends EventEmitter {
    private connection;
    private builder;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationLoader>;
    run(): Promise<void>;
    rollback(): Promise<void>;
    refresh(): Promise<void>;
    close(): Promise<void>;
    private getRunGenerator;
    private getRollbackGenerator;
    private findMigrationsToRun;
    private findMigrationsToRollback;
    private getLastBatchNumber;
    private existMigrationsTable;
    private createMigrationsTable;
    private selectAppliedMigrations;
    private load;
}
