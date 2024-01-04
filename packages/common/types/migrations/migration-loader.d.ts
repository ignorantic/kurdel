import { Newable } from '../types.js';
import { Migration } from './migration.js';
export declare class MigrationLoader {
    load(): Promise<Newable<Migration>[]>;
}
