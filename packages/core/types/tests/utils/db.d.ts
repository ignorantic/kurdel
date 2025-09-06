export interface IDatabase {
    get(sql: string, params?: unknown[]): Promise<any>;
    all(sql: string, params?: unknown[]): Promise<any[]>;
    run(sql: string, params?: unknown[]): Promise<any>;
    close(): void | Promise<void>;
}
/** Simple in-memory mock with spies */
export declare class MockDatabase implements IDatabase {
    calls: {
        get: any[];
        all: any[];
        run: any[];
    };
    data: Map<string, any>;
    get(sql: string, params?: unknown[]): Promise<any>;
    all(sql: string, params?: unknown[]): Promise<any>;
    run(sql: string, params?: unknown[]): Promise<{
        changes: number;
        lastID: number;
    }>;
    close(): Promise<void>;
}
