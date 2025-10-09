import type { Newable } from '@kurdel/common';
import type { Identifier } from '../api/identifier.js';
import type { Container, BindingToContract, BindingWithInContract } from '../api/container.js';
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
export declare class IoCContainer implements Container {
    private readonly dictionary;
    private readonly parent?;
    constructor(parent?: IoCContainer);
    /**
     * Creates a new **request-scoped** child container.
     *
     * The child delegates lookups to this container (its parent) when a binding
     * is not found locally. Singleton bindings registered in the parent remain
     * shared; bindings added to the child are isolated to the child’s lifetime.
     *
     * @returns A new `IoCContainer` whose parent is this container.
     *
     * @example
     * const root = new IoCContainer();
     * const scope = root.createScope(); // per-request container
     * // scope.get(...) will fall back to root if not found locally
     */
    createScope(): IoCContainer;
    /**
     * Bind an identifier (interface or symbol) to an implementation.
     *
     * @example
     * ```ts
     * container.bind<IDatabase>(IDatabase).to(SQLiteDatabase);
     * ```
     */
    bind<T>(key: Identifier<T>): BindingToContract<T>;
    /**
     * Register a concrete class in the container.
     *
     * @example
     * ```ts
     * container.put(UserService);
     * container.put(UserController).with({ userService: UserService });
     * ```
     */
    put<T>(constructor: Newable<T>): BindingWithInContract<T>;
    /**
     * Register a custom factory for a binding.
     *
     * @param key Identifier to bind
     * @param factory Function that produces an instance
     * @returns void
     */
    toFactory<T>(key: Identifier<T>, factory: () => T): void;
    /**
     * Register a ready-made instance (value provider) for the identifier.
     * Subsequent `get()` calls will return the same instance.
     *
     * @throws Error if the identifier is already registered in this container.
     */
    set<T>(key: Identifier<T>, value: T): void;
    /**
     * Resolve an instance bound to the given identifier.
     *
     * Resolution rules:
     * 1) If the binding is not present locally, delegate to the parent container
     *    (if any). If still missing, throw.
     * 2) If the binding has a `toFactory`, invoke it:
     *    - `scope === 'Singleton'`: lazily create and cache once per container.
     *    - otherwise: create a new instance on each call.
     * 3) If the binding has a concrete `boundEntity`:
     *    - if it is a non-function value → return the value as-is;
     *    - if it is a class constructor → resolve `depsMap` recursively and `new` it;
     *      for singletons, cache the constructed instance.
     *
     * Notes:
     * - Parent/child containers form a hierarchy: lookups fall back to the parent.
     * - Singleton caching is per-container (shared with parent only if the binding
     *   was registered in the parent).
     *
     * @typeParam T - Resolved instance type.
     * @param key - Identifier (token/class) to resolve.
     * @returns The resolved instance of type `T`.
     * @throws Error if no binding was found in this container hierarchy.
     *
     * @example
     * // token-based binding
     * container.bind<IDb>(DBToken).to(SqliteDb).inSingletonScope();
     * const db = container.get<IDb>(DBToken);
     *
     * // factory-based singleton (lazy)
     * container.toFactorySingleton?.(CfgToken, () => loadConfig());
     * const cfg = container.get(CfgToken);
     */
    get<T>(key: Identifier<T>): T;
    /**
     * Check whether a binding exists for the given identifier
     * **in this container**.
     *
     * Note: this implementation does not consult a parent container.
     * If you use hierarchical scoping, prefer a version that also
     * checks `parent.has(key)` to mirror `get()` fallback behavior.
     *
     * @param key - Identifier (token/class) to look up.
     * @returns `true` if the identifier is bound in this container.
     */
    has(key: Identifier): boolean;
}
