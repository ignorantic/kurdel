import { Identifier } from './types.js';
import { Binding } from './binding.js';
export declare class BindingWithContract<T> {
    private binding;
    constructor(binding: Binding<T>);
    with(dependencies: Identifier[]): BindingWithContract<T>;
}
