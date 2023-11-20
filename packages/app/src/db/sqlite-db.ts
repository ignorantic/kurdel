import { IDatabase } from 'ijon';
import sqlite3 from 'sqlite3';

export class SQLiteDB implements IDatabase {
  private db: sqlite3.Database;

  constructor(path: string) {
    this.db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error('Error running sql: ' + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public all(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          console.error('Error running sql: ' + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error('Error running sql: ' + sql);
          console.error(err);
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
          console.error('Error closing database');
          console.error(err);
          reject(err);
        } else {
          console.log('Closed the database connection');
          resolve();
        }
      });
    });
  }
}

