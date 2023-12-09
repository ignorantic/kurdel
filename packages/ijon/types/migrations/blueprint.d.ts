export declare class Blueprint {
    private columns;
    integer(name: string): void;
    string(name: string, length?: number): void;
    primaryKey(columnName: string): void;
    getColumnDefinitions(): string;
}
