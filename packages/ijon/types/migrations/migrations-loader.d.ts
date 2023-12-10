/// <reference types="node" resolution-mode="require"/>
import EventEmitter from 'events';
import { IDatabase } from '../db/interfaces.js';
import { Migration } from './migration.js';
export declare class MigrationsLoader extends EventEmitter {
    private connection;
    private builder;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationsLoader>;
    up(): Promise<void>;
    down(): Promise<void>;
    findMigrationsToRun(): Promise<Migration[]>;
    findMigrationsToRollback(): Promise<Migration[]>;
    getLastBatchNumber(): Promise<number>;
    existMigrationsTable(): Promise<Boolean>;
    createMigrationsTable(): Promise<void>;
    selectAppliedMigrations(batch?: number): Promise<string[]>;
    private load;
}
