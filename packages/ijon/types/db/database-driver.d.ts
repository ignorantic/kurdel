export interface DatabaseConfig {
    type: string;
    host: string;
    port: number;
    user: string;
    password: string;
}
export declare abstract class DatabaseDriver<T extends DatabaseConfig> {
    protected config: T;
    constructor(config: T);
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}
