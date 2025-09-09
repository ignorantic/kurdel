import { BindingWithInContract } from './bindingWithInContract.js';
/**
 * Contract returned by `IoCContainer.bind`.
 *
 * Provides methods to bind an abstract identifier (interface, symbol, etc.)
 * to a concrete implementation or to an existing instance.
 */
export class BindingToContract {
    constructor(binding) {
        this.binding = binding;
    }
    /**
     * Bind the identifier to a class constructor.
     *
     * @example
     * ```ts
     * container.bind(IDatabase).to(SQLiteDatabase);
     * ```
     *
     * @param constructor The class to instantiate when resolving this identifier.
     * @returns {BindingWithInContract<T>} Allows chaining `.inSingletonScope()`.
     */
    to(constructor) {
        this.binding.boundEntity = constructor;
        return new BindingWithInContract(this.binding);
    }
    /**
     * Bind the identifier to an existing instance.
     * Marks this binding as a singleton.
     *
     * @example
     * ```ts
     * const db = new SQLiteDatabase();
     * container.bind(IDatabase).toInstance(db);
     * ```
     *
     * @param instance The instance to use when resolving this identifier.
     */
    toInstance(instance) {
        this.binding.boundEntity = instance;
        this.binding.cache = instance;
        this.binding.scope = 'Singleton';
        this.binding.activated = true;
    }
}
//# sourceMappingURL=bindingToContract.js.map