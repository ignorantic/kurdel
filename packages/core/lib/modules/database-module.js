import { IDatabase, DBConnector } from '@kurdel/db';
class NoopDatabase {
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
 * - Exports: IDatabase (DB connection)
 * - Imports: none
 *
 * Responsible for creating a database connection (via DBConnector)
 * and binding it into the IoC container as a singleton instance.
 */
export const DatabaseModule = {
    exports: { db: IDatabase },
    async register(ioc, config) {
        if (config.db === false) {
            // bind stub instead of trying to run DBConnector
            ioc.bind(IDatabase).toInstance(new NoopDatabase());
            return;
        }
        const connector = new DBConnector();
        const dbConnection = await connector.run();
        ioc.bind(IDatabase).toInstance(dbConnection);
    },
};
//# sourceMappingURL=database-module.js.map