import { describe, it, expect } from 'vitest';
import { Binding } from '../src/binding.js';
import { BindingToContract } from '../src/bindingToContract.js';
import { BindingWithContract } from '../src/bindingWithContract.js';
import { BindingWithInContract } from '../src/bindingWithInContract.js';

describe('Binding', () => {
  it('should initialize with default values', () => {
    const binding = new Binding<any>();
    expect(binding.boundEntity).toBeNull();
    expect(binding.depsMap).toBeUndefined();
    expect(binding.scope).toBe('Transient');
    expect(binding.cache).toBeNull();
    expect(binding.activated).toBe(false);
  });
});

describe('BindingToContract', () => {
  it('should bind a class via .to()', () => {
    class TestClass {}
    const binding = new Binding<TestClass>();
    const contract = new BindingToContract(binding);

    const result = contract.to(TestClass);

    expect(binding.boundEntity).toBe(TestClass);
    expect(result).toBeInstanceOf(BindingWithInContract);
  });

  it('should bind an instance via .toInstance()', () => {
    class TestClass {}
    const instance = new TestClass();
    const binding = new Binding<TestClass>();
    const contract = new BindingToContract(binding);

    contract.toInstance(instance);

    expect(binding.boundEntity).toBe(instance);
    expect(binding.cache).toBe(instance);
    expect(binding.scope).toBe('Singleton');
    expect(binding.activated).toBe(true);
  });
});

describe('BindingWithContract', () => {
  it('should assign depsMap when calling .with()', () => {
    class Dep {}
    class TestClass { dep: Dep; constructor({ dep }: { dep: Dep }) { this.dep = dep; } }

    const binding = new Binding<TestClass>();
    const contract = new BindingWithContract(binding);

    const deps = { dep: Dep };
    contract.with(deps);

    expect(binding.depsMap).toEqual(deps);
  });
});

describe('BindingWithInContract', () => {
  it('should set scope to Singleton with .inSingletonScope()', () => {
    const binding = new Binding<any>();
    const contract = new BindingWithInContract(binding);

    contract.inSingletonScope();

    expect(binding.scope).toBe('Singleton');
  });

  it('should delegate .with() to BindingWithContract', () => {
    class Dep {}
    const binding = new Binding<any>();
    const contract = new BindingWithInContract(binding);

    const deps = { dep: Dep };
    contract.with(deps);

    expect(binding.depsMap).toEqual(deps);
  });
});
