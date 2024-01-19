import { Newable } from '@kurdel/common';
import { Migration } from './migration.js';
export declare class MigrationLoader {
    load(): Promise<Newable<Migration>[]>;
}
