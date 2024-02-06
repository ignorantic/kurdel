export class BindingInContract {
    binding;
    constructor(binding) {
        this.binding = binding;
    }
    inSingletonScope() {
        this.binding.scope = 'Singleton';
    }
}
