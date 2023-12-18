import { IDatabase } from '../db/interfaces.js';
import { Blueprint } from './blueprint.js';
type Configure = (table: Blueprint) => void;
export declare class Schema {
    private connection;
    constructor(connection: IDatabase);
    create(tableName: string, configure: Configure): Promise<void>;
    drop(tableName: string): Promise<void>;
}
export {};
