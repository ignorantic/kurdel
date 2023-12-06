import { Schema } from '../schema/schema.js';
export class Migration {
    schema;
    constructor(connection) {
        this.schema = new Schema(connection);
    }
}
