import { Schema } from '../schema/schema.js';
import { IDatabase } from './interfaces.js';
export declare abstract class Migration {
    protected schema: Schema;
    constructor(connection: IDatabase);
    abstract up(): Promise<any>;
    abstract down(): Promise<any>;
}
