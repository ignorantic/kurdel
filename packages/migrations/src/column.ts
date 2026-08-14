export type ColumnDefault = string | number | boolean | null;

export class Column {
  private readonly modifiers: string[] = [];

  constructor(
    public readonly name: string,
    public readonly type: string,
  ) {}

  primaryKey(): this {
    return this.addModifier('PRIMARY KEY');
  }

  notNull(): this {
    return this.addModifier('NOT NULL');
  }

  nullable(): this {
    const index = this.modifiers.indexOf('NOT NULL');
    if (index >= 0) this.modifiers.splice(index, 1);
    return this;
  }

  unique(): this {
    return this.addModifier('UNIQUE');
  }

  default(value: ColumnDefault): this {
    return this.addModifier(`DEFAULT ${this.serializeDefault(value)}`);
  }

  defaultRaw(expression: string): this {
    if (!expression.trim()) throw new Error('Default expression cannot be empty');
    return this.addModifier(`DEFAULT ${expression}`);
  }

  references(table: string, column: string, onDelete?: string): this {
    let constraint = `REFERENCES ${table} (${column})`;
    if (onDelete) constraint += ` ON DELETE ${onDelete}`;
    return this.addModifier(constraint);
  }

  toString(): string {
    return `${this.name} ${this.type} ${this.modifiers.join(' ')}`.trim();
  }

  private addModifier(modifier: string): this {
    if (!this.modifiers.includes(modifier)) this.modifiers.push(modifier);
    return this;
  }

  private serializeDefault(value: ColumnDefault): string {
    if (value === null) return 'NULL';
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (typeof value === 'number') return String(value);
    return `'${value.replaceAll("'", "''")}'`;
  }
}
