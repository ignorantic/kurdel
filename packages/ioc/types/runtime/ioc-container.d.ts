import { Newable } from '@kurdel/common';
import { Identifier } from 'src/api/identifier.js';
import { Container, BindingToContract, BindingWithInContract } from 'src/api/container.js';
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
    get<T>(key: Identifier<T>): T;
    has(key: Identifier): boolean;
}
//# sourceMappingURL=ioc-container.d.ts.map