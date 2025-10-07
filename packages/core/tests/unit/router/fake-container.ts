import type { Newable } from '@kurdel/common';
import type { Container, Identifier } from '@kurdel/ioc';

type DepsMap = Record<string, Identifier<any>>;

type ValueBinding = { kind: 'value'; value: any };
type FactoryBinding = {
  kind: 'factory';
  factory: (c: Container) => any;
  singleton?: boolean;
  cache?: any;
};
type ClassBinding = {
  kind: 'class';
  ctor: Newable<any>;
  deps?: DepsMap;
  singleton?: boolean;
  cache?: any;
};

type Binding = ValueBinding | FactoryBinding | ClassBinding;

export class FakeContainer implements Container {
  private readonly parent?: FakeContainer;
  private readonly registry = new Map<Identifier<any> | Newable<any>, Binding>();

  constructor(parent?: FakeContainer) {
    this.parent = parent;
  }

  bind<T>(key: Identifier<T>) {
    // Builder is stateful for this bind() call
    const state: Partial<ClassBinding> = { kind: 'class' };

    const commitClass = () => {
      if (!state.ctor) throw new Error('bind(...).to(Impl) must be called before inSingletonScope()/with()');
      this.registry.set(key, {
        kind: 'class',
        ctor: state.ctor,
        deps: state.deps ?? {},
        singleton: !!state.singleton,
        cache: undefined,
      });
    };

    return {
      to: (impl: Newable<T>) => {
        state.ctor = impl;
        // Return builder for chaining .with() / .inSingletonScope()
        const chain = {
          with: (deps: Record<string, Identifier<any>>) => {
            state.deps = deps;
            commitClass();
            return chain;
          },
          inSingletonScope: () => {
            state.singleton = true;
            commitClass();
            return chain;
          },
        } as BindingWithInContractImpl<T>;
        // If caller doesn't call any chain method, we still need to commit.
        // But to keep semantic explicitness, we commit on first chain call.
        // If they only call .to(Impl) and stop, it's okay — deps default to {}.
        // So we eagerly commit now with defaults:
        commitClass();
        return chain;
      },
      toInstance: (value: T) => {
        this.registry.set(key, { kind: 'value', value });
      },
    } as BindingToContractImpl<T>;
  }

  put<T>(ctor: Newable<T>) {
    // Register the class under its own constructor as the identifier
    const binding: ClassBinding = { kind: 'class', ctor, deps: {}, singleton: false, cache: undefined };
    this.registry.set(ctor, binding);

    const chain = {
      with: (deps: Record<string, Identifier<any>>) => {
        binding.deps = deps;
        return chain;
      },
      inSingletonScope: () => {
        binding.singleton = true;
        return chain;
      },
    } as BindingWithInContractImpl<T>;

    return chain;
  }

  toFactory<T>(key: Identifier<T>, factory: () => T): void {
    this.registry.set(key, { kind: 'factory', factory: () => factory(), singleton: false, cache: undefined });
  }

  set<T>(key: Identifier<T>, value: T): void {
    this.registry.set(key, { kind: 'value', value });
  }

  get<T>(key: Identifier<T> | Newable<T>): T {
    const found = this.findBinding(key);
    if (!found) {
      if (this.parent) return this.parent.get<T>(key as any);
      throw new Error(`DI: token not found: ${String(key)}`);
    }
    const { owner, binding } = found;

    switch (binding.kind) {
      case 'value':
        return binding.value as T;

      case 'factory': {
        if (binding.singleton) {
          if (binding.cache !== undefined) return binding.cache;
          const created = binding.factory(this);
          binding.cache = created;
          // cache lives at the owner where binding is defined
          owner.registry.set(key as any, binding);
          return created;
        }
        return binding.factory(this);
      }

      case 'class': {
        if (binding.singleton) {
          if (binding.cache !== undefined) return binding.cache as T;
          const inst = this.instantiate(binding);
          binding.cache = inst;
          owner.registry.set(key as any, binding);
          return inst;
        }
        return this.instantiate(binding);
      }
    }
  }

  has(key: Identifier<any> | Newable<any>): boolean {
    if (this.registry.has(key)) return true;
    return this.parent?.has(key as any) ?? false;
  }

  createScope(): Container {
    return new FakeContainer(this);
  }

  private findBinding(key: Identifier<any> | Newable<any>): { owner: FakeContainer; binding: Binding } | null {
    if (this.registry.has(key)) {
      return { owner: this, binding: this.registry.get(key)! };
    }
    if (this.parent) return this.parent.findBinding(key);
    return null;
  }

  private instantiate<T>(binding: ClassBinding): T {
    const depsMap = binding.deps ?? {};
    const depsObj: Record<string, any> = {};
    for (const [prop, token] of Object.entries(depsMap)) {
      depsObj[prop] = this.get(token as any);
    }
    // Assumes constructors follow `constructor(depsObj)` shape
    return new binding.ctor(depsObj);
  }
}

// Helper types for the fluent builders (local to this file)
type BindingToContractImpl<T> = {
  to(impl: Newable<T>): BindingWithInContractImpl<T>;
  toInstance(value: T): void;
};

type BindingWithInContractImpl<T> = {
  with(deps: Record<string, Identifier<any>>): BindingWithInContractImpl<T>;
  inSingletonScope(): BindingWithInContractImpl<T>;
};

