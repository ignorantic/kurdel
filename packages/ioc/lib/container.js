import { Binding } from './binding.js';
import { BindingToContract } from './bindingToContract.js';
import { BindingWithInContract } from './bindingWithInContract.js';
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
    constructor() {
        this.dictionary = new Map();
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
        return new BindingToContract(binding);
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
        return new BindingWithInContract(binding);
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
    get(key) {
        const target = this.dictionary.get(key);
        if (!target) {
            throw new Error(`No dependency found for ${key.toString()}`);
        }
        if (target.toFactory) {
            return target.toFactory();
        }
        if (!target.boundEntity) {
            throw new Error(`No dependency found for ${key.toString()}`);
        }
        const { boundEntity, depsMap } = target;
        if (typeof boundEntity !== 'function') {
            return boundEntity;
        }
        const Constructor = boundEntity;
        const resolvedDeps = depsMap
            ? Object.fromEntries(Object.entries(depsMap).map(([k, dep]) => [k, this.get(dep)]))
            : {};
        if (target.scope === 'Singleton') {
            if (!target.activated) {
                target.cache = new Constructor(resolvedDeps);
                target.activated = true;
            }
            return target.cache;
        }
        return new Constructor(resolvedDeps);
    }
    has(key) {
        return this.dictionary.has(key);
    }
}
//# sourceMappingURL=container.js.map