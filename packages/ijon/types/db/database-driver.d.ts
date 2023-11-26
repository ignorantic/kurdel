import { DatabaseConfig } from './interfaces.js';
export declare abstract class DatabaseDriver<T extends DatabaseConfig> {
    protected config: T;
    constructor(config: T);
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}
