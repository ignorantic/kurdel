import { Blueprint } from './blueprint.js';
export class Schema {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async create(tableName, configure) {
        const blueprint = new Blueprint();
        configure(blueprint);
        const columnDefinitions = blueprint.getColumnDefinitions();
        const sql = `CREATE TABLE ${tableName} (${columnDefinitions});`;
        this.connection.run({ sql, params: [] });
    }
    async drop(tableName) {
        const sql = `DROP TABLE ${tableName};`;
        this.connection.run({ sql, params: [] });
    }
}
