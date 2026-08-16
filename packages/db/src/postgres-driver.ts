import { DatabaseDriver } from './database-driver.js';
import type { DatabaseConfig } from './interfaces.js';
import { PostgresDB } from './postgres-db.js';

export interface PostgresConfig extends DatabaseConfig {
  type: 'postgres';
  database?: string;
  connectionString?: string;
}

export class PostgresDriver extends DatabaseDriver<PostgresConfig> {
  private db?: PostgresDB;

  async connect(): Promise<void> {
    this.db = new PostgresDB({
      connectionString: this.config.connectionString,
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl,
    });
    await this.db.connect();
  }

  async disconnect(): Promise<void> {
    await this.db?.close();
    this.db = undefined;
  }

  get connection(): PostgresDB | undefined {
    return this.db;
  }
}
