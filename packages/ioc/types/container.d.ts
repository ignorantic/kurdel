import { Newable } from '@kurdel/common';
import { Identifier } from './types.js';
import { BindingToContract } from './bindingToContract.js';
import { BindingWithInContract } from './bindingWithInContract.js';
export declare class IoCContainer {
    private readonly dictionary;
    bind<T>(key: Identifier<T>): BindingToContract<T>;
    put<T>(constructor: Newable<T>): BindingWithInContract<T>;
    get<T>(key: Identifier<T>): T;
}
