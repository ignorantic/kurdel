import { IDatabase, DBConnector } from '@kurdel/db';
export class NoopDatabase {
    constructor() {
        this.query = this.error;
        this.get = this.error;
        this.all = this.error;
        this.run = this.error;
        this.close = this.error;
    }
    async error() {
        throw new Error('Database is disabled (db=false in config)');
    }
}
/**
 * DatabaseModule
 *
 * - Provides a database connection if enabled
 * - Exports the IDatabase token
 * - Falls back to NoopDatabase when disabled
 */
export class DatabaseModule {
    constructor() {
        this.exports = { db: IDatabase };
    }
    async register(ioc, config) {
        if (config.db === false) {
            ioc.bind(IDatabase).toInstance(new NoopDatabase());
            return;
        }
        const connector = new DBConnector();
        const connection = await connector.run();
        ioc.bind(IDatabase).toInstance(connection);
    }
}
//# sourceMappingURL=database-module.js.map