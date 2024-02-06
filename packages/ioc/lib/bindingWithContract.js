export class BindingWithContract {
    binding;
    constructor(binding) {
        this.binding = binding;
    }
    with(dependencies) {
        this.binding.dependencies = dependencies;
        return new BindingWithContract(this.binding);
    }
}
