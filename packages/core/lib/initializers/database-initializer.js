import { IDatabase, DBConnector } from '@kurdel/db';
export class DatabaseInitializer {
    async run(ioc, config) {
        if (config.db === false)
            return;
        const connector = new DBConnector();
        try {
            const dbConnection = await connector.run();
            ioc.bind(IDatabase).toInstance(dbConnection);
        }
        catch (err) {
            throw new Error(`Application failed to init database: ${String(err)}`);
        }
    }
}
//# sourceMappingURL=database-initializer.js.map