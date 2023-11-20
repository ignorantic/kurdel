import { IDatabase } from './db/interfaces.js';

export abstract class Service {
  private db: IDatabase;
  private table: string;

  constructor(db: IDatabase, table: string) {
    this.db = db;
    this.table = table;
  }

  public async create(names: string[]) {
    await this.db.run(`INSERT INTO ${this.table} (name) VALUES (?)`, names);
    return this.db.get(`SELECT * FROM ${this.table} WHERE name = ?`, names);
  }

  public async find(id: number) {
    return this.db.get(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
  }

  public async all() {
    return this.db.all(`SELECT * FROM ${this.table}`, []);
  }
}
