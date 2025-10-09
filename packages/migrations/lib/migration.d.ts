import type { IDatabase } from '@kurdel/db';
import { Schema } from './schema.js';
export declare abstract class Migration {
    protected schema: Schema;
    constructor(connection: IDatabase);
    abstract up(): Promise<any>;
    abstract down(): Promise<any>;
}
