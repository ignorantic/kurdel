import { Column } from './column.js';
export class Blueprint {
    columns = [];
    integer(name) {
        this.columns.push(new Column(name, 'INTEGER'));
    }
    string(name, length = 255) {
        this.columns.push(new Column(name, `VARCHAR(${length})`));
    }
    primaryKey(columnName) {
        const column = this.columns.find(column => column.name === columnName);
        if (column) {
            column.options.push('PRIMARY KEY');
        }
    }
    getColumnDefinitions() {
        return this.columns.map(column => column.toString()).join(', ');
    }
}
//# sourceMappingURL=blueprint.js.map