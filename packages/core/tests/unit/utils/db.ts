// Adjust to your real IDatabase interface
export interface IDatabase {
  get(sql: string, params?: unknown[]): Promise<any>;
  all(sql: string, params?: unknown[]): Promise<any[]>;
  run(sql: string, params?: unknown[]): Promise<any>;
  close(): void | Promise<void>;
}

/** Simple in-memory mock with spies */
export class MockDatabase implements IDatabase {
  calls = { get: [] as any[], all: [] as any[], run: [] as any[] };
  data = new Map<string, any>(); // optional: fake storage

  async get(sql: string, params?: unknown[]) {
    this.calls.get.push({ sql, params });
    return this.data.get(sql);
  }
  async all(sql: string, params?: unknown[]) {
    this.calls.all.push({ sql, params });
    return this.data.get(sql) ?? [];
  }
  async run(sql: string, params?: unknown[]) {
    this.calls.run.push({ sql, params });
    return { changes: 1, lastID: 1 };
  }
  async close() { /* no-op */ }
}
