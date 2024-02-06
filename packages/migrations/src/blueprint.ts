import { Column } from './column.js';

export class Blueprint {
  private columns: Column[] = [];

  integer(name: string): void {
    this.columns.push(new Column(name, 'INTEGER'));
  }

  string(name: string, length: number = 255): void {
    this.columns.push(new Column(name, `VARCHAR(${length})`));
  }

  primaryKey(columnName: string): void {
    const column = this.columns.find(column => column.name === columnName);
    if (column) {
      column.options.push('PRIMARY KEY');
    }
  }

  getColumnDefinitions() {
    return this.columns.map(column => column.toString()).join(', ');
  }
}
