import { Identifier } from '../api/identifier.js';
import { Binding } from './binding.js';
/**
 * Fluent contract returned from IoCContainer.put() when configuring dependencies.
 *
 * Allows you to declare dependencies as a key-to-identifier map.
 *
 * @example
 * ```ts
 * ioc.put(UserController).with({
 *   userService: UserService,
 *   logger: Logger,
 * });
 * ```
 */
export declare class BindingWithContract<T> {
    private binding;
    constructor(binding: Binding<T>);
    /**
     * Declare dependencies for this binding as a map of identifiers.
     * Each entry will be resolved from the container and injected into
     * the constructor as an object.
     *
     * @example
     * ```ts
     * ioc.put(UserController).with({
     *   userService: UserService,
     *   logger: Logger,
     * });
     * ```
     */
    with(deps: Record<string, Identifier>): this;
}
