import { IDatabase } from './db/interfaces.js';
export declare abstract class Service {
    private db;
    private table;
    constructor(db: IDatabase, table: string);
    create(names: string[]): Promise<any>;
    find(id: number): Promise<any>;
    all(): Promise<any>;
}
