import { Newable } from '@kurdel/common';
import { Binding } from './binding.js';
import { BindingWithInContract } from './bindingWithInContract.js';
export declare class BindingToContract<T> {
    private binding;
    constructor(binding: Binding<T>);
    to(constructor: Newable<T>): BindingWithInContract<T>;
    toInstance(instance: T): void;
}
