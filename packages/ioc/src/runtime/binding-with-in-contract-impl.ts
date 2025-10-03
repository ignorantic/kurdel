import { BindingWithInContract } from 'src/api/container.js';
import { Identifier } from 'src/api/identifier.js';

import { Binding } from './binding.js';
import { BindingWithContract } from './binding-with-contract.js';
import { BindingInContract } from './binding-in-contract.js';

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
export class BindingWithInContractImpl<T> implements BindingWithInContract<T> {
  private bindingInContract: BindingInContract<T>;
  private bindingWithContract: BindingWithContract<T>;

  constructor(binding: Binding<T>) {
    this.bindingInContract = new BindingInContract<T>(binding);
    this.bindingWithContract = new BindingWithContract<T>(binding);
  }

  /**
   * Make this binding a singleton — only one instance will be created
   * and cached in the container.
   */
  inSingletonScope(): this {
    this.bindingInContract.inSingletonScope();
    return this;
  }

  /**
   * Declare dependencies for this binding as a map of identifiers.
   * Each entry will be resolved from the container and injected into
   * the constructor as an object.
   */
  with(deps: Record<string, Identifier>): this {
    this.bindingWithContract.with(deps);
    return this;
  }
}
