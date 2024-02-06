import { BindingInContract } from './bindingInContract.js';
import { BindingWithContract } from './bindingWithContract.js';
export class BindingWithInContract {
    bindingInContract;
    bindingWithContract;
    constructor(binding) {
        this.bindingInContract = new BindingInContract(binding);
        this.bindingWithContract = new BindingWithContract(binding);
    }
    inSingletonScope() {
        this.bindingInContract.inSingletonScope();
    }
    with(dependencies) {
        this.bindingWithContract.with(dependencies);
    }
}
