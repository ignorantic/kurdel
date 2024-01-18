import { Newable } from '@kurdel/common';
import { Binding } from './binding.js';
import { BindingWithInContract } from './bindingWithInContract.js';

export class BindingToContract<T> {
  private binding: Binding<T>;

  constructor(binding: Binding<T>) {
    this.binding = binding;
  }

  to(constructor: Newable<T>) {
    this.binding.boundEntity = constructor;
    return new BindingWithInContract(this.binding);
  }

  toInstance(instance: T) {
    this.binding.boundEntity = instance;
    this.binding.cache = instance;
    this.binding.scope = 'Singleton';
    this.binding.activated = true;
  }
}
