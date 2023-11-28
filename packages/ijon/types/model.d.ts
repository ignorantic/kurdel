import { IDatabase } from './db/interfaces.js';
export declare abstract class Model {
    private db;
    private builder;
    protected abstract table: string;
    constructor(db: IDatabase);
    create(data: Record<string, any>): Promise<void>;
    find(field: string, values: any[]): Promise<any>;
    findAll(): Promise<any>;
}
