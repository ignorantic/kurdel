/** Simple in-memory mock with spies */
export class MockDatabase {
    calls = { get: [], all: [], run: [] };
    data = new Map(); // optional: fake storage
    async get(sql, params) {
        this.calls.get.push({ sql, params });
        return this.data.get(sql);
    }
    async all(sql, params) {
        this.calls.all.push({ sql, params });
        return this.data.get(sql) ?? [];
    }
    async run(sql, params) {
        this.calls.run.push({ sql, params });
        return { changes: 1, lastID: 1 };
    }
    async close() { }
}
