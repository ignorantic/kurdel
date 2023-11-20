export class Service {
    db;
    table;
    constructor(db, table) {
        this.db = db;
        this.table = table;
    }
    async create(names) {
        await this.db.run(`INSERT INTO ${this.table} (name) VALUES (?)`, names);
        return this.db.get(`SELECT * FROM ${this.table} WHERE name = ?`, names);
    }
    async find(id) {
        return this.db.get(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
    }
    async all() {
        return this.db.all(`SELECT * FROM ${this.table}`, []);
    }
}
