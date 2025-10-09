import type { Newable } from '@kurdel/common';
import type { Identifier } from './identifier.js';
export interface BindingToContract<T> {
    to(impl: Newable<T>): BindingWithInContract<T>;
    toInstance(value: T): void;
}
export interface BindingWithInContract<T> {
    with(deps: Record<string, Identifier<T>>): this;
    inSingletonScope(): this;
}
/**
 * Minimal Dependency Injection container contract.
 *
 * Implementations should support registering values/classes/factories
 * and resolving dependencies recursively. Consumers depend on this
 * interface (DIP), not a concrete container class.
 */
export interface Container {
    /**
     * Bind an abstract identifier (token/interface) to a class implementation.
     * Returns a fluent builder to configure deps and scope.
     */
    bind<T>(key: Identifier<T>): BindingToContract<T>;
    /**
     * Register a concrete class so it can be resolved (constructor injection).
     * Returns a fluent builder to supply constructor deps and scope.
     */
    put<T>(ctor: Newable<T>): BindingWithInContract<T>;
    /**
     * Register a factory function that produces an instance on each resolve
     * (unless the binding is later marked as singleton by the implementation).
     */
    toFactory<T>(key: Identifier<T>, factory: () => T): void;
    /**
     * Register a ready-made instance (value provider) for the identifier.
     * Subsequent `get()` calls return the same instance.
     */
    set<T>(key: Identifier<T>, value: T): void;
    /**
     * Resolve an instance for the identifier.
     * Implementations should recursively resolve declared dependencies.
     * @throws if the identifier is not registered in this container hierarchy.
     */
    get<T>(key: Identifier<T>): T;
    /**
     * Check if an identifier is registered in this container or its parents.
     */
    has(key: Identifier): boolean;
    /**
     * Create a child (request-scoped) container whose parent is this container.
     * Lookups fall back to the parent if not found locally.
     * Implementations may share singleton cache with the parent.
     */
    createScope?(): Container;
}
