import type { Newable } from '@kurdel/common';
import type { Migration } from './migration.js';
export declare class MigrationLoader {
    load(): Promise<Newable<Migration>[]>;
}
