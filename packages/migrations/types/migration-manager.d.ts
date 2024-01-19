/// <reference types="node" resolution-mode="require"/>
import EventEmitter from 'events';
import { IDatabase } from '@kurdel/db';
export declare class MigrationManager extends EventEmitter {
    private connection;
    private loader;
    private registry;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationManager>;
    run(): Promise<void>;
    rollback(): Promise<void>;
    refresh(): Promise<void>;
    close(): Promise<void>;
    private runMigrations;
    private rollbackMigrations;
    private findMigrationsToRun;
    private findMigrationsToRollback;
}
