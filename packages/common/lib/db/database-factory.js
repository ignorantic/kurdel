import { SQLiteDriver } from './sqlite-driver.js';
export class DatabaseFactory {
    static createDriver(config) {
        switch (config.type) {
            case 'sqlite':
                return new SQLiteDriver(config);
            default:
                throw new Error(`Unsupported database type: ${config.type}`);
        }
    }
}
