import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
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
export interface ModelConfig {
    /** Controller class */
    use: Newable<Model>;
    /** Dependencies to be injected from IoC */
    deps?: Record<string, Identifier>;
}
export type ModelList = (Newable<Model> | ModelConfig)[];
export {};
