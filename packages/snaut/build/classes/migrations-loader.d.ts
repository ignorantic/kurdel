import { IDatabase } from 'ijon';
export declare class MigrationsLoader {
    private connection;
    constructor(connection: IDatabase);
    static create(): Promise<MigrationsLoader>;
    up(): Promise<void>;
    down(): Promise<void>;
    private load;
}
