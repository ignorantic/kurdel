import { Identifier } from './types.js';
import { Binding } from './binding.js';
import { BindingInContract } from './bindingInContract.js';
import { BindingWithContract } from './bindingWithContract.js';

export class BindingWithInContract<T> {
  private bindingInContract: BindingInContract<T>;
  private bindingWithContract: BindingWithContract<T>;

  constructor(binding: Binding<T>) {
    this.bindingInContract = new BindingInContract<T>(binding);
    this.bindingWithContract = new BindingWithContract<T>(binding);
  }

  inSingletonScope() {
    this.bindingInContract.inSingletonScope();
  }

  with(dependencies: Identifier[]) {
    this.bindingWithContract.with(dependencies);
  }
}
