import { Newable } from '@kurdel/common';

import { Identifier } from 'src/api/identifier.js';
import { Container, BindingToContract, BindingWithInContract } from 'src/api/container.js';

import { Binding } from './binding.js';
import { BindingToContractImpl } from './binding-to-contract-impl.js';
import { BindingWithInContractImpl } from './binding-with-in-contract-impl.js';

/**
 * Simple Inversion of Control (IoC) container.
 *
 * Supports two registration styles:
 * - `bind` for interfaces or symbols → bind an identifier to implementation
 * - `put` for concrete classes → register classes with dependencies
 *
 * Provides dependency resolution with support for constructor injection
 * and singleton scope.
 */
export class IoCContainer implements Container {
  private readonly dictionary = new Map<Identifier, Binding<unknown>>();

  /**
   * Bind an identifier (interface or symbol) to an implementation.
   *
   * @example
   * ```ts
   * container.bind<IDatabase>(IDatabase).to(SQLiteDatabase);
   * ```
   */
  public bind<T>(key: Identifier<T>): BindingToContract<T> {
    const binding = new Binding<T>();
    if (this.dictionary.has(key)) {
      throw new Error(`Dependency ${key.toString()} already registered.`);
    }
    this.dictionary.set(key, binding);
    return new BindingToContractImpl(binding);
  }

  /**
   * Register a concrete class in the container.
   *
   * @example
   * ```ts
   * container.put(UserService);
   * container.put(UserController).with({ userService: UserService });
   * ```
   */
  public put<T>(constructor: Newable<T>): BindingWithInContract<T> {
    if (this.dictionary.has(constructor)) {
      throw new Error(`Dependency ${constructor.name.toString()} already registered.`);
    }
    const binding = new Binding<T>();
    binding.boundEntity = constructor;
    this.dictionary.set(constructor, binding);
    return new BindingWithInContractImpl(binding);
  }

  /**
   * Register a custom factory for a binding.
   *
   * @param key Identifier to bind
   * @param factory Function that produces an instance
   * @returns void
   */
  public toFactory<T>(key: Identifier<T>, factory: () => T) {
    const binding = new Binding<T>();
    binding.toFactory = factory;
    this.dictionary.set(key, binding);
  }

  /**
   * Resolve an instance from the container.
   *
   * If the binding has a dependency map, those dependencies will
   * be resolved recursively and injected into the constructor.
   *
   * @example
   * ```ts
   * const userService = container.get(UserService);
   * const userController = container.get(UserController); // deps injected automatically
   * ```
   */
  public get<T>(key: Identifier<T>): T {
    const target = this.dictionary.get(key);

    if (!target) {
      throw new Error(`No dependency found for ${key.toString()}`);
    }

    if (target.toFactory) {
      return target.toFactory() as T;
    }

    if (!target.boundEntity) {
      throw new Error(`No dependency found for ${key.toString()}`);
    }

    const { boundEntity, depsMap } = target;

    if (typeof boundEntity !== 'function') {
      return boundEntity as T;
    }

    const Constructor = boundEntity as Newable<T>;

    const resolvedDeps = depsMap
      ? Object.fromEntries(
          Object.entries(depsMap).map(([k, dep]) => [k, this.get(dep)])
        )
      : {};

    if (target.scope === 'Singleton') {
      if (!target.activated) {
        target.cache = new Constructor(resolvedDeps);
        target.activated = true;
      }
      return target.cache as T;
    }

    return new Constructor(resolvedDeps);
  }

  public has(key: Identifier): boolean {
    return this.dictionary.has(key);
  }
}
