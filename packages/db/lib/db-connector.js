import { JSONLoader } from '@kurdel/common';
import { DB_CONFIG_FILENAME } from './consts.js';
import { DatabaseFactory } from './database-factory.js';
export class DBConnector {
    constructor() {
        this.jsonLoader = new JSONLoader();
    }
    async run() {
        try {
            const dbConfig = this.jsonLoader.load(DB_CONFIG_FILENAME);
            return this.establish(dbConfig);
        }
        catch (err) {
            throw new Error(`Database connection failed: ${String(err)}`);
        }
    }
    async establish(dbConfig) {
        const driver = DatabaseFactory.createDriver(dbConfig);
        await driver.connect();
        if (!driver.connection) {
            throw new Error('Database connection failed');
        }
        return driver.connection;
    }
}
//# sourceMappingURL=db-connector.js.map