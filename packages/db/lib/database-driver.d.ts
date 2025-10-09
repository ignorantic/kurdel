import type { IDatabaseConfig } from './interfaces.js';
export declare abstract class DatabaseDriver<T extends IDatabaseConfig> {
    protected config: T;
    constructor(config: T);
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}
