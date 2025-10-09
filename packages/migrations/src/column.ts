export class Column {
  constructor(
    public name: string,
    public type: string,
    public options: string[] = []
  ) {}

  toString() {
    return `${this.name} ${this.type} ${this.options.join(' ')}`.trim();
  }
}
