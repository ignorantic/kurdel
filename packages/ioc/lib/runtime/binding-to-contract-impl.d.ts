import { Newable } from '@kurdel/common';
import { BindingToContract, BindingWithInContract } from '../api/container.js';
import { Binding } from './binding.js';
/**
 * Contract returned by `IoCContainer.bind`.
 *
 * Provides methods to bind an abstract identifier (interface, symbol, etc.)
 * to a concrete implementation or to an existing instance.
 */
export declare class BindingToContractImpl<T> implements BindingToContract<T> {
    private binding;
    constructor(binding: Binding<T>);
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
    to(constructor: Newable<T>): BindingWithInContract<T>;
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
    toInstance(instance: T): void;
}
