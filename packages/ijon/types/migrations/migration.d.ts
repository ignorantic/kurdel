import { IDatabase } from '../db/interfaces.js';
import { Schema } from './schema.js';
export declare abstract class Migration {
    protected schema: Schema;
    constructor(connection: IDatabase);
    abstract up(): Promise<any>;
    abstract down(): Promise<any>;
}
