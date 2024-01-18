import { Newable } from '@kurdel/common';
import { Identifier } from './types.js';
import { Binding } from './binding.js';
import { BindingToContract } from './bindingToContract.js';
import { BindingWithInContract } from './bindingWithInContract.js';

export class IoCContainer {
  private readonly dictionary = new Map<Identifier, Binding<unknown>>();

  public bind<T>(key: Identifier<T>) {
    const binding = new Binding<T>();
    if (this.dictionary.has(key)) {
      throw new Error(`Dependency ${key.toString()} already registered.`);
    }
    this.dictionary.set(key, binding);
    return new BindingToContract(binding);
  }

  public put<T>(constructor: Newable<T>) {
    if (this.dictionary.has(constructor)) {
      throw new Error(`Dependency ${constructor.name.toString()} already registered.`);
    }
    const binding = new Binding<T>();
    binding.boundEntity = constructor;
    this.dictionary.set(constructor, binding);
    return new BindingWithInContract(binding);
  }

  public get<T>(key: Identifier<T>): T {
    const target = this.dictionary.get(key);

    if (!target || !target.boundEntity) {
      throw new Error(`No dependency found for ${key.toString()}`);
    }

    const { boundEntity, dependencies } = target;
    const Constructor = boundEntity as Newable<T>;
    const resolvedDependencies = dependencies.map((dep: Identifier) => this.get(dep));

    if (target.scope === 'Singleton') {
      if (!target.activated) {
        target.cache = new Constructor(...resolvedDependencies);
        target.activated = true;
      }
      return target.cache as T;
    }

    return new Constructor(...resolvedDependencies);
  }
}

