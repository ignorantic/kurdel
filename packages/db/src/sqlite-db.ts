import sqlite3 from 'sqlite3';
import type { DatabaseQuery, Database, DatabaseSession } from './interfaces.js';

export class SQLiteDB implements Database {
  readonly dialect = 'sqlite' as const;
  private db: sqlite3.Database;
  private queue: Promise<void> = Promise.resolve();

  constructor(path: string) {
    this.db = new sqlite3.Database(path, err => {
      if (err) {
        console.error('Could not connect to database', err);
      }
    });
  }

  public get({ sql, params }: DatabaseQuery): Promise<any> {
    return this.enqueue(() => this.getRaw({ sql, params }));
  }

  public all({ sql, params }: DatabaseQuery): Promise<any> {
    return this.enqueue(() => this.allRaw({ sql, params }));
  }

  public run({ sql, params }: DatabaseQuery): Promise<void> {
    return this.enqueue(() => this.runRaw({ sql, params }));
  }

  public transaction<T>(work: (transaction: DatabaseSession) => Promise<T>): Promise<T> {
    return this.enqueue(async () => {
      await this.runRaw({ sql: 'BEGIN IMMEDIATE;', params: [] });
      const transaction: DatabaseSession = {
        get: query => this.getRaw(query),
        all: query => this.allRaw(query),
        run: query => this.runRaw(query),
      };
      try {
        const result = await work(transaction);
        await this.runRaw({ sql: 'COMMIT;', params: [] });
        return result;
      } catch (error) {
        await this.runRaw({ sql: 'ROLLBACK;', params: [] });
        throw error;
      }
    });
  }

  public close(): Promise<void> {
    return this.enqueue(() => new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }));
  }

  private getRaw({ sql, params }: DatabaseQuery): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private allRaw({ sql, params }: DatabaseQuery): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private runRaw({ sql, params }: DatabaseQuery): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }
}
