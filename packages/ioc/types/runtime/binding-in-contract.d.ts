import { Binding } from './binding.js';
/**
 * Fluent contract returned after `.to()` or `.toInstance()`.
 *
 * Allows you to configure the binding scope:
 * - transient (default) → new instance every time
 * - singleton → one instance cached and reused
 */
export declare class BindingInContract<T> {
    private binding;
    constructor(binding: Binding<T>);
    /**
     * Make this binding a singleton.
     *
     * @example
     * ```ts
     * container.bind<IDatabase>(IDatabase).to(SQLiteDatabase).inSingletonScope();
     * ```
     */
    inSingletonScope(): this;
}
//# sourceMappingURL=binding-in-contract.d.ts.map