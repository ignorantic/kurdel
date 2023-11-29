import { JSONLoader } from '../json-loader.js';
import { DatabaseFactory } from './database-factory.js';
export class DBConnector {
    jsonLoader;
    constructor() {
        this.jsonLoader = new JSONLoader();
    }
    async run() {
        const dbConfig = this.jsonLoader.load('./db.config.json');
        return await this.establish(dbConfig);
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
