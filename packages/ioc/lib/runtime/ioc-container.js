import { Binding } from '../runtime/binding.js';
import { BindingToContractImpl } from '../runtime/binding-to-contract-impl.js';
import { BindingWithInContractImpl } from '../runtime/binding-with-in-contract-impl.js';
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
    /** @inheritdoc */
    toFactory(key, factory) {
        const binding = new Binding();
        binding.toFactory = factory;
        this.dictionary.set(key, binding);
    }
    /** @inheritdoc */
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
    get(key) {
        const local = this.dictionary.get(key);
        if (!local) {
            if (this.parent)
                return this.parent.get(key);
            throw new Error(`No dependency found for ${String(key)}`);
        }
        // factory binding
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
        // value binding
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
     * Check whether a binding exists for the given identifier **in this container**.
     *
     * Note: this implementation does not consult a parent container.
     * If you use hierarchical scoping, prefer a version that also checks `parent.has(key)`
     * to mirror `get()` fallback behavior.
     *
     * @param key - Identifier (token/class) to look up.
     * @returns `true` if the identifier is bound in this container.
     */
    has(key) {
        return this.dictionary.has(key);
    }
    /**
     * Build a dependency graph for debugging and visualization.
     *
     * Traverses constructor and factory bindings, following `depsMap`
     * recursively across parent containers.
     *
     * @param rootKey - Optional starting identifier (defaults to all local bindings).
     * @returns Dependency tree(s) describing how bindings reference each other.
     */
    getGraph(rootKey) {
        const roots = rootKey ? [rootKey] : Array.from(this.dictionary.keys());
        const walk = (key, path = new Set(), fromParent = false) => {
            if (path.has(key)) {
                return { key: this.keyLabel(key) + ' (circular)', deps: [] };
            }
            const binding = this.dictionary.get(key) ?? this.parent?.dictionary.get(key);
            if (!binding) {
                return { key: this.keyLabel(key) + ' (unbound)', deps: [] };
            }
            const isFromParent = fromParent || !this.dictionary.has(key);
            const deps = binding.depsMap ? Object.values(binding.depsMap) : [];
            const newPath = new Set(path);
            newPath.add(key);
            const depsNodes = deps.map((dep) => walk(dep, newPath, isFromParent));
            const labelParts = [this.keyLabel(key)];
            if (isFromParent)
                labelParts.push('[parent]');
            if (binding.toFactory)
                labelParts.push('[factory]');
            if (binding.scope === 'Singleton')
                labelParts.push('[singleton]');
            if (binding.boundEntity && typeof binding.boundEntity !== 'function')
                labelParts.push('[instance]');
            return {
                key: labelParts.join(' '),
                fromParent: isFromParent,
                deps: depsNodes,
            };
        };
        return roots.map((k) => walk(k));
    }
    /** @inheritdoc */
    printGraph(rootKey) {
        const graph = this.getGraph(rootKey);
        const render = (node, prefix = '') => {
            const line = `${prefix}- ${node.key}\n`;
            const nextPrefix = prefix + '  ';
            return line + node.deps.map((d) => render(d, nextPrefix)).join('');
        };
        for (const root of graph) {
            console.log(render(root));
        }
    }
    /** Returns a human-readable label for an identifier (for diagnostics). */
    keyLabel(key) {
        if (typeof key === 'string')
            return key;
        if (typeof key === 'symbol')
            return key.description ?? String(key);
        if (typeof key === 'function')
            return key.name || '[AnonymousClass]';
        return String(key);
    }
}
//# sourceMappingURL=ioc-container.js.map