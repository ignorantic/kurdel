import { BindingWithContract } from '../runtime/binding-with-contract.js';
import { BindingInContract } from '../runtime/binding-in-contract.js';
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
export class BindingWithInContractImpl {
    constructor(binding) {
        this.bindingInContract = new BindingInContract(binding);
        this.bindingWithContract = new BindingWithContract(binding);
    }
    /**
     * Make this binding a singleton — only one instance will be created
     * and cached in the container.
     */
    inSingletonScope() {
        this.bindingInContract.inSingletonScope();
        return this;
    }
    /**
     * Declare dependencies for this binding as a map of identifiers.
     * Each entry will be resolved from the container and injected into
     * the constructor as an object.
     */
    with(deps) {
        this.bindingWithContract.with(deps);
        return this;
    }
}
//# sourceMappingURL=binding-with-in-contract-impl.js.map