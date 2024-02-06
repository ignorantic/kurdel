import { Binding } from './binding.js';

export class BindingInContract<T> {
  private binding: Binding<T>;

  constructor(binding: Binding<T>) {
    this.binding = binding;
  }

  inSingletonScope() {
    this.binding.scope = 'Singleton';
  }
}
