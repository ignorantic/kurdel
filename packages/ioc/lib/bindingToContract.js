import { BindingWithInContract } from './bindingWithInContract.js';
export class BindingToContract {
    binding;
    constructor(binding) {
        this.binding = binding;
    }
    to(constructor) {
        this.binding.boundEntity = constructor;
        return new BindingWithInContract(this.binding);
    }
    toInstance(instance) {
        this.binding.boundEntity = instance;
        this.binding.cache = instance;
        this.binding.scope = 'Singleton';
        this.binding.activated = true;
    }
}
