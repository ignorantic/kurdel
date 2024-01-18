import { Binding } from './binding.js';
import { BindingToContract } from './bindingToContract.js';
import { BindingWithInContract } from './bindingWithInContract.js';
export class IoCContainer {
    dictionary = new Map();
    bind(key) {
        const binding = new Binding();
        if (this.dictionary.has(key)) {
            throw new Error(`Dependency ${key.toString()} already registered.`);
        }
        this.dictionary.set(key, binding);
        return new BindingToContract(binding);
    }
    put(constructor) {
        if (this.dictionary.has(constructor)) {
            throw new Error(`Dependency ${constructor.name.toString()} already registered.`);
        }
        const binding = new Binding();
        binding.boundEntity = constructor;
        this.dictionary.set(constructor, binding);
        return new BindingWithInContract(binding);
    }
    get(key) {
        const target = this.dictionary.get(key);
        if (!target || !target.boundEntity) {
            throw new Error(`No dependency found for ${key.toString()}`);
        }
        const { boundEntity, dependencies } = target;
        const Constructor = boundEntity;
        const resolvedDependencies = dependencies.map((dep) => this.get(dep));
        if (target.scope === 'Singleton') {
            if (!target.activated) {
                target.cache = new Constructor(...resolvedDependencies);
                target.activated = true;
            }
            return target.cache;
        }
        return new Constructor(...resolvedDependencies);
    }
}
