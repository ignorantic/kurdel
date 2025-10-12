import type { Newable } from '@kurdel/common';

import type { BindingToContract, BindingWithInContract } from 'src/api/container.js';

import type { Binding } from 'src/runtime/binding.js';
import { BindingWithInContractImpl } from 'src/runtime/binding-with-in-contract-impl.js';

/**
 * Contract returned by `IoCContainer.bind`.
 *
 * Provides methods to bind an abstract identifier (interface, symbol, etc.)
 * to a concrete implementation or to an existing instance.
 */
export class BindingToContractImpl<T> implements BindingToContract<T> {
  private binding: Binding<T>;

  constructor(binding: Binding<T>) {
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
  to(constructor: Newable<T>): BindingWithInContract<T> {
    this.binding.boundEntity = constructor;
    return new BindingWithInContractImpl(this.binding);
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
  toInstance(instance: T): void {
    this.binding.boundEntity = instance;
    this.binding.cache = instance;
    this.binding.scope = 'Singleton';
    this.binding.activated = true;
  }
}
