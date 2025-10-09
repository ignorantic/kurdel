import type { BindingWithInContract } from '../api/container.js';
import type { Identifier } from '../api/identifier.js';
import type { Binding } from './binding.js';
/**
 * Fluent contract returned from IoCContainer.put().
 *
 * Allows you to configure additional options for the binding:
 *
 * - declare dependencies with .with({ key: Identifier })
 * - control scope with .inSingletonScope()
 *
 * @example
 * ```ts
 * ioc.put(UserController)
 *    .with({ userService: UserService, logger: Logger })
 *    .inSingletonScope();
 * ```
 */
export declare class BindingWithInContractImpl<T> implements BindingWithInContract<T> {
    private bindingInContract;
    private bindingWithContract;
    constructor(binding: Binding<T>);
    /**
     * Make this binding a singleton — only one instance will be created
     * and cached in the container.
     */
    inSingletonScope(): this;
    /**
     * Declare dependencies for this binding as a map of identifiers.
     * Each entry will be resolved from the container and injected into
     * the constructor as an object.
     */
    with(deps: Record<string, Identifier>): this;
}
