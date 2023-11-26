import { DatabaseDriver } from './database-driver.js';
import { SQLiteDB } from './sqlite-db.js';
export class SQLiteDriver extends DatabaseDriver {
    db;
    constructor(config) {
        super(config);
    }
    async connect() {
        this.db = await new Promise((resolve, reject) => {
            try {
                const db = new SQLiteDB(this.config.filename);
                return resolve(db);
            }
            catch (err) {
                return reject(err);
            }
        });
    }
    async disconnect() {
        await new Promise((resolve, reject) => {
            if (this.db) {
                try {
                    this.db.close();
                    this.db = undefined;
                }
                catch (err) {
                    return reject(err);
                }
            }
            return resolve(null);
        });
    }
    get connection() {
        return this.db;
    }
}
