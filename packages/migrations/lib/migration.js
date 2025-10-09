import { Schema } from './schema.js';
export class Migration {
    schema;
    constructor(connection) {
        this.schema = new Schema(connection);
    }
}
//# sourceMappingURL=migration.js.map