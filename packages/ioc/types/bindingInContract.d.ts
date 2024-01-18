import { Binding } from './binding.js';
export declare class BindingInContract<T> {
    private binding;
    constructor(binding: Binding<T>);
    inSingletonScope(): void;
}
