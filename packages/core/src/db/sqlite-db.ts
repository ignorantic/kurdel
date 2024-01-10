import sqlite3 from 'sqlite3';
import { DatabaseQuery, IDatabase } from './interfaces.js';

export class SQLiteDB implements IDatabase {
  private db: sqlite3.Database;

  constructor(path: string) {
    this.db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      }
    });
  }

  public get({ sql, params }: DatabaseQuery): Promise<any> {
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

  public all({ sql, params }: DatabaseQuery): Promise<any> {
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

  public run({ sql, params }: DatabaseQuery): Promise<void> {
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

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

