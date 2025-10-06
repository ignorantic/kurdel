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
export class IoCContainer {
    constructor(parent) {
        this.dictionary = new Map();
        this.parent = parent;
    }
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
    createScope() {
        return new IoCContainer(this);
    }
    /**
     * Bind an identifier (interface or symbol) to an implementation.
     *
     * @example
     * ```ts
     * container.bind<IDatabase>(IDatabase).to(SQLiteDatabase);
     * ```
     */
    bind(key) {
        const binding = new Binding();
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
    put(constructor) {
        if (this.dictionary.has(constructor)) {
            throw new Error(`Dependency ${constructor.name.toString()} already registered.`);
        }
        const binding = new Binding();
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
    toFactory(key, factory) {
        const binding = new Binding();
        binding.toFactory = factory;
        this.dictionary.set(key, binding);
    }
    /**
     * Register a ready-made instance (value provider) for the identifier.
     * Subsequent `get()` calls will return the same instance.
     *
     * @throws Error if the identifier is already registered in this container.
     */
    set(key, value) {
        if (this.dictionary.has(key)) {
            throw new Error(`Dependency ${String(key)} already registered.`);
        }
        const b = new Binding();
        b.boundEntity = value;
        b.scope = 'Singleton';
        b.activated = true;
        b.cache = value;
        this.dictionary.set(key, b);
    }
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
    get(key) {
        // is it local binding?
        const local = this.dictionary.get(key);
        if (!local) {
            if (this.parent)
                return this.parent.get(key);
            throw new Error(`No dependency found for ${String(key)}`);
        }
        // factory
        if (local.toFactory) {
            if (local.scope === 'Singleton') {
                if (!local.activated) {
                    local.cache = local.toFactory();
                    local.activated = true;
                }
                return local.cache;
            }
            return local.toFactory();
        }
        if (!local.boundEntity) {
            throw new Error(`No dependency found for ${String(key)}`);
        }
        const { boundEntity, depsMap } = local;
        if (typeof boundEntity !== 'function') {
            return boundEntity;
        }
        const Ctor = boundEntity;
        const resolvedDeps = depsMap
            ? Object.fromEntries(Object.entries(depsMap).map(([k, dep]) => [k, this.get(dep)]))
            : {};
        if (local.scope === 'Singleton') {
            if (!local.activated) {
                local.cache = new Ctor(resolvedDeps);
                local.activated = true;
            }
            return local.cache;
        }
        return new Ctor(resolvedDeps);
    }
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
    has(key) {
        return this.dictionary.has(key);
    }
}
//# sourceMappingURL=ioc-container.js.map