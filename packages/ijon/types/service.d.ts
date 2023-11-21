import { IDatabase } from './db/interfaces.js';
export declare abstract class Service {
    private db;
    private builder;
    private table;
    constructor(db: IDatabase, table: string);
    create(data: Record<string, any>): Promise<void>;
    find(field: string, values: any[]): Promise<any>;
    findAll(): Promise<any>;
}
