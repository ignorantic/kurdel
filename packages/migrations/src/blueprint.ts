import { Column } from './column.js';

export interface IndexDefinition {
  columns: string[];
  name?: string;
  unique: boolean;
}

export class Blueprint {
  private readonly columns: Column[] = [];
  private readonly constraints: string[] = [];
  private readonly indexes: IndexDefinition[] = [];

  integer(name: string): Column {
    return this.addColumn(name, 'INTEGER');
  }

  string(name: string, length: number = 255): Column {
    return this.addColumn(name, `VARCHAR(${length})`);
  }

  boolean(name: string): Column {
    return this.addColumn(name, 'BOOLEAN');
  }

  datetime(name: string): Column {
    return this.addColumn(name, 'DATETIME');
  }

  /** Supports both the legacy single-column form and composite keys. */
  primaryKey(columns: string | string[]): void {
    if (typeof columns === 'string') {
      this.requireColumn(columns).primaryKey();
      return;
    }
    this.requireColumns(columns);
    this.constraints.push(`PRIMARY KEY (${columns.join(', ')})`);
  }

  unique(columns: string[], name?: string): void {
    this.requireColumns(columns);
    const prefix = name ? `CONSTRAINT ${name} ` : '';
    this.constraints.push(`${prefix}UNIQUE (${columns.join(', ')})`);
  }

  foreign(
    column: string,
    referencesTable: string,
    referencesColumn: string,
    options: { name?: string; onDelete?: string } = {},
  ): void {
    this.requireColumn(column);
    const prefix = options.name ? `CONSTRAINT ${options.name} ` : '';
    const onDelete = options.onDelete ? ` ON DELETE ${options.onDelete}` : '';
    this.constraints.push(
      `${prefix}FOREIGN KEY (${column}) REFERENCES ${referencesTable} (${referencesColumn})${onDelete}`
    );
  }

  index(columns: string[], name?: string): void {
    this.requireColumns(columns);
    this.indexes.push({ columns: [...columns], name, unique: false });
  }

  uniqueIndex(columns: string[], name?: string): void {
    this.requireColumns(columns);
    this.indexes.push({ columns: [...columns], name, unique: true });
  }

  getColumnDefinitions(): string {
    return [
      ...this.columns.map(column => column.toString()),
      ...this.constraints,
    ].join(', ');
  }

  getIndexes(): readonly IndexDefinition[] {
    return this.indexes;
  }

  private addColumn(name: string, type: string): Column {
    if (this.columns.some(column => column.name === name)) {
      throw new Error(`Column '${name}' is already defined`);
    }
    const column = new Column(name, type);
    this.columns.push(column);
    return column;
  }

  private requireColumn(name: string): Column {
    const column = this.columns.find(candidate => candidate.name === name);
    if (!column) throw new Error(`Unknown column '${name}'`);
    return column;
  }

  private requireColumns(columns: string[]): void {
    if (columns.length === 0) throw new Error('At least one column is required');
    columns.forEach(column => this.requireColumn(column));
  }
}
