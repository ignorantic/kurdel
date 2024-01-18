import { Identifier } from './types.js';
import { Binding } from './binding.js';
export declare class BindingWithInContract<T> {
    private bindingInContract;
    private bindingWithContract;
    constructor(binding: Binding<T>);
    inSingletonScope(): void;
    with(dependencies: Identifier[]): void;
}
