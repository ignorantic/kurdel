/**
 * Fluent contract returned after `.to()` or `.toInstance()`.
 *
 * Allows you to configure the binding scope:
 * - transient (default) → new instance every time
 * - singleton → one instance cached and reused
 */
export class BindingInContract {
    constructor(binding) {
        this.binding = binding;
    }
    /**
     * Make this binding a singleton.
     *
     * @example
     * ```ts
     * container.bind<IDatabase>(IDatabase).to(SQLiteDatabase).inSingletonScope();
     * ```
     */
    inSingletonScope() {
        this.binding.scope = 'Singleton';
        return this;
    }
}
//# sourceMappingURL=binding-in-contract.js.map