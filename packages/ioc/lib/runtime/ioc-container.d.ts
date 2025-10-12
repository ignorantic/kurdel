import type { Newable } from '@kurdel/common';
import type { Identifier } from '../api/identifier.js';
import type { Container, BindingToContract, BindingWithInContract } from '../api/container.js';
interface DependencyNode {
    key: string;
    fromParent?: boolean;
    deps: DependencyNode[];
}
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
    /** @inheritdoc */
    toFactory<T>(key: Identifier<T>, factory: () => T): void;
    /** @inheritdoc */
    set<T>(key: Identifier<T>, value: T): void;
    /**
     * Resolve an instance bound to the given identifier.
     *
     * Resolution rules:
     * 1) If the binding is not present locally, delegate to the parent container.
     * 2) If the binding has a `toFactory`, invoke it (respecting singleton scope).
     * 3) If the binding has a concrete `boundEntity`, recursively resolve its deps
     *    and instantiate it; cache singletons.
     *
     * @typeParam T - Resolved instance type.
     * @param key - Identifier (token/class) to resolve.
     * @returns The resolved instance of type `T`.
     * @throws If no binding was found in this container hierarchy.
     */
    get<T>(key: Identifier<T>): T;
    /**
     * Check whether a binding exists for the given identifier **in this container**.
     *
     * Note: this implementation does not consult a parent container.
     * If you use hierarchical scoping, prefer a version that also checks `parent.has(key)`
     * to mirror `get()` fallback behavior.
     *
     * @param key - Identifier (token/class) to look up.
     * @returns `true` if the identifier is bound in this container.
     */
    has(key: Identifier): boolean;
    /**
     * Build a dependency graph for debugging and visualization.
     *
     * Traverses constructor and factory bindings, following `depsMap`
     * recursively across parent containers.
     *
     * @param rootKey - Optional starting identifier (defaults to all local bindings).
     * @returns Dependency tree(s) describing how bindings reference each other.
     */
    getGraph(rootKey?: Identifier): DependencyNode[];
    /** @inheritdoc */
    printGraph(rootKey?: Identifier): void;
    /** Returns a human-readable label for an identifier (for diagnostics). */
    private keyLabel;
}
export {};
