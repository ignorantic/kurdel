export class Column {
    name;
    type;
    options;
    constructor(name, type, options = []) {
        this.name = name;
        this.type = type;
        this.options = options;
    }
    toString() {
        return `${this.name} ${this.type} ${this.options.join(' ')}`.trim();
    }
}
//# sourceMappingURL=column.js.map