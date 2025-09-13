import { IDatabase, DBConnector } from '@kurdel/db';
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
            class NoopDatabase {
                async query() {
                    throw new Error('Database disabled');
                }
            }
            ioc.bind(IDatabase).toInstance(new NoopDatabase());
            return;
        }
        const connector = new DBConnector();
        const connection = await connector.run();
        ioc.bind(IDatabase).toInstance(connection);
    }
}
//# sourceMappingURL=database-module.js.map