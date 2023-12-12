/// <reference types="node" resolution-mode="require"/>
import EventEmitter from 'events';
import { IDatabase } from '../db/interfaces.js';
export declare class MigrationsLoader extends EventEmitter {
    private connection;
    private builder;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationsLoader>;
    up(): Promise<void>;
    down(): Promise<void>;
    close(): Promise<void>;
    private findMigrationsToRun;
    private findMigrationsToRollback;
    private getLastBatchNumber;
    private existMigrationsTable;
    private createMigrationsTable;
    private selectAppliedMigrations;
    private load;
}
