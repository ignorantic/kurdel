import { IDatabase } from '@kurdel/db';
interface ModelDeps {
    db: IDatabase;
}
export declare abstract class Model {
    private db;
    private builder;
    protected abstract table: string;
    constructor(deps: ModelDeps);
    create(data: Record<string, any>): Promise<void>;
    find(field: string, values: any[]): Promise<any>;
    findAll(): Promise<any>;
}
export {};
