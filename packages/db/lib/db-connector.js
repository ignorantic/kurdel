import { JSONLoader } from '@kurdel/common';
import { DB_CONFIG_FILENAME } from './consts.js';
import { DatabaseFactory } from './database-factory.js';
export class DBConnector {
    jsonLoader;
    constructor() {
        this.jsonLoader = new JSONLoader();
    }
    async run() {
        const dbConfig = this.jsonLoader.load(DB_CONFIG_FILENAME);
        return this.establish(dbConfig);
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
