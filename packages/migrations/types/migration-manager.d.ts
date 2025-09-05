import EventEmitter from 'events';
import { IDatabase } from '@kurdel/db';
import { MigrationRegistry } from './migration-registry.js';
export declare class MigrationManager extends EventEmitter {
    private connection;
    private loader;
    private registry;
    constructor(connection: IDatabase, registry: MigrationRegistry);
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
