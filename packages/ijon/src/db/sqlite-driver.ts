import { DatabaseDriver } from './database-driver.js';
import { DatabaseConfig } from './interfaces.js';
import { SQLiteDB } from './sqlite-db.js';

export interface SQLiteConfig extends DatabaseConfig {
  filename: string;
}

export class SQLiteDriver extends DatabaseDriver<SQLiteConfig> {
  private db?: SQLiteDB;

  constructor(config: SQLiteConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.db = await new Promise<SQLiteDB>((resolve, reject) => {
      try {
        const db = new SQLiteDB(this.config.filename);
        return resolve(db);
      } catch(err) {
        return reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    await new Promise((resolve, reject) => {
      if (this.db) {
        try {
          this.db.close();
          this.db = undefined;
        } catch(err) {
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

