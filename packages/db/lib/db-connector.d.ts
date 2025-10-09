import type { IDatabase } from './interfaces.js';
export declare class DBConnector {
    private jsonLoader;
    constructor();
    run(): Promise<IDatabase>;
    private establish;
}
