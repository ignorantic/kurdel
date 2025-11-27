import type { Newable } from '@kurdel/common';
import type { Container, DependencyNode, Identifier } from '@kurdel/ioc';

/** Maps property name → DI token */
type DepsMap = Record<string, Identifier<any>>;

type ValueBinding = {
  kind: 'value';
  value: any;
};

type FactoryBinding = {
  kind: 'factory';
  factory: (c: Container) => any;
  singleton: boolean;
  cache?: any;
};

type ClassBinding = {
  kind: 'class';
  ctor: Newable<any>;
  deps: DepsMap;
  singleton: boolean;
  cache?: any;
};

type Binding = ValueBinding | FactoryBinding | ClassBinding;

export class FakeContainer implements Container {
  private readonly parent?: FakeContainer;
  private readonly registry = new Map<Identifier<any> | Newable<any>, Binding>();

  constructor(parent?: FakeContainer) {
    this.parent = parent;
  }

  /*──────────────────────────────────────────────────────────
   * bind(token).to(Class).with(deps).inSingletonScope()
   *──────────────────────────────────────────────────────────*/

  bind<T>(key: Identifier<T>) {
    let ctor: Newable<T> | undefined;
    let deps: DepsMap = {};
    let singleton = false;

    const commit = () => {
      if (!ctor) {
        throw new Error('bind(key).to(Class) must be called before with()/inSingletonScope()');
      }
      this.registry.set(key, {
        kind: 'class',
        ctor,
        deps,
        singleton,
        cache: undefined,
      });
    };

    return {
      to: (impl: Newable<T>) => {
        ctor = impl;
        commit();
        return {
          with(d: DepsMap) {
            deps = d;
            commit();
            return this;
          },
          inSingletonScope() {
            singleton = true;
            commit();
            return this;
          },
        } as BindingWithIn<T>;
      },
      toInstance: (value: T) => {
        this.registry.set(key, { kind: 'value', value });
      },
    } as BindingTo<T>;
  }

  /*──────────────────────────────────────────────────────────
   * put(Class) → register class under its own constructor
   *──────────────────────────────────────────────────────────*/

  put<T>(ctor: Newable<T>) {
    const binding: ClassBinding = {
      kind: 'class',
      ctor,
      deps: {},
      singleton: false,
      cache: undefined,
    };
    this.registry.set(ctor, binding);

    return {
      with(d: DepsMap) {
        binding.deps = d;
        return this;
      },
      inSingletonScope() {
        binding.singleton = true;
        return this;
      },
    } as BindingWithIn<T>;
  }

  /*──────────────────────────────────────────────────────────
   * toFactory(token, factory)
   *──────────────────────────────────────────────────────────*/

  toFactory<T>(key: Identifier<T>, factory: () => T): void {
    this.registry.set(key, {
      kind: 'factory',
      factory: () => factory(),
      singleton: false,
      cache: undefined,
    });
  }

  /*──────────────────────────────────────────────────────────
   * set(token, value)
   *──────────────────────────────────────────────────────────*/

  set<T>(key: Identifier<T>, value: T): void {
    this.registry.set(key, { kind: 'value', value });
  }

  /*──────────────────────────────────────────────────────────
   * get(token)
   *──────────────────────────────────────────────────────────*/

  get<T>(key: Identifier<T> | Newable<T>): T {
    const found = this.findBinding(key);
    if (!found) {
      if (this.parent) return this.parent.get<T>(key as any);
      throw new Error(`DI: token not found: ${String(key)}`);
    }

    const { owner, binding } = found;

    switch (binding.kind) {
      case 'value':
        return binding.value;

      case 'factory':
        if (binding.singleton) {
          if (binding.cache !== undefined) return binding.cache;
          const created = binding.factory(this);
          binding.cache = created;
          owner.registry.set(key as any, binding);
          return created;
        }
        return binding.factory(this);

      case 'class':
        if (binding.singleton) {
          if (binding.cache !== undefined) return binding.cache as T;
          const inst = this.instantiate(binding) as T;
          binding.cache = inst;
          owner.registry.set(key as any, binding);
          return inst;
        }
        return this.instantiate(binding);
    }
  }

  has(key: Identifier<any> | Newable<any>): boolean {
    if (this.registry.has(key)) return true;
    return this.parent?.has(key as any) ?? false;
  }

  /*──────────────────────────────────────────────────────────
   * Request scoping
   *──────────────────────────────────────────────────────────*/

  createScope(): Container {
    return new FakeContainer(this);
  }

  /*──────────────────────────────────────────────────────────
   * Graph (not needed for runtime tests)
   *──────────────────────────────────────────────────────────*/

  getGraph(_rootKey?: Identifier): DependencyNode[] {
    return [
      {
        key: '',
        fromParent: false,
        deps: [],
      },
    ];
  }

  printGraph(): void {
    return;
  }

  /*──────────────────────────────────────────────────────────
   * Internal helpers
   *──────────────────────────────────────────────────────────*/

  private findBinding(
    key: Identifier<any> | Newable<any>
  ): { owner: FakeContainer; binding: Binding } | null {
    if (this.registry.has(key)) {
      return { owner: this, binding: this.registry.get(key)! };
    }
    return this.parent ? this.parent.findBinding(key) : null;
  }

  private instantiate<T>(binding: ClassBinding): T {
    const depsObj: Record<string, any> = {};
    for (const [prop, token] of Object.entries(binding.deps)) {
      depsObj[prop] = this.get(token as any);
    }
    return new binding.ctor(depsObj);
  }
}

/*──────────────────────────────────────────────────────────
 * Fluent builder types
 *──────────────────────────────────────────────────────────*/

type BindingTo<T> = {
  to(impl: Newable<T>): BindingWithIn<T>;
  toInstance(value: T): void;
};

type BindingWithIn<T> = {
  with(deps: DepsMap): BindingWithIn<T>;
  inSingletonScope(): BindingWithIn<T>;
};
