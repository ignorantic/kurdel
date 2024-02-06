import { Identifier } from './types.js';
import { Binding } from './binding.js';

export class BindingWithContract<T> {
  private binding: Binding<T>;

  constructor(binding: Binding<T>) {
    this.binding = binding;
  }

  with(dependencies: Identifier[]) {
    this.binding.dependencies = dependencies;
    return new BindingWithContract<T>(this.binding);
  }
}
