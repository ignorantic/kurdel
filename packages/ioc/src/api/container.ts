import type { Newable } from '@kurdel/common';
import type { Identifier } from 'src/api/identifier.js';

/**
 * Fluent API returned by {@link Container.bind}.
 * Allows binding an abstract identifier (interface, symbol, token)
 * to a concrete implementation and configuring additional metadata.
 */
export interface BindingToContract<T> {
  /**
   * Bind this identifier to the given class constructor.
   * @param impl - Class to instantiate when this identifier is resolved.
   * @returns A fluent builder for configuring deps/scope.
   */
  to(impl: Newable<T>): BindingWithInContract<T>;

  /**
   * Bind this identifier to a pre-created instance.
   * The same value will be returned for each resolution.
   * @param value - Instance to associate with the identifier.
   */
  toInstance(value: T): void;
}

/**
 * Fluent API returned by {@link Container.put} or {@link BindingToContract.to}.
 * Used to configure constructor dependencies and scope.
 */
export interface BindingWithInContract<T> {
  /**
   * Define constructor dependencies for the bound class.
   * Each key corresponds to a constructor parameter name,
   * and the value is the identifier of the dependency.
   *
   * @example
   * container.put(UserService).with({ repo: UserRepository });
   */
  with(deps: Record<string, Identifier>): this;

  /**
   * Mark this binding as a singleton.
   * The same instance will be reused across resolutions within this container
   * (and possibly its child scopes, depending on the implementation).
   */
  inSingletonScope(): this;
}

/**
 * Node in a dependency graph produced by {@link Container.getGraph}.
 */
export interface DependencyNode {
  /** Human-readable name or key of the binding. */
  key: string;

  /** Indicates whether this dependency originated from a parent container. */
  fromParent?: boolean;

  /** Nested dependency nodes (constructor deps). */
  deps: DependencyNode[];
}

/**
 * Minimal Dependency Injection container contract.
 *
 * Defines all essential operations supported by the Kurdel IoC system.
 * Implementations should follow SOLID principles and be runtime-agnostic.
 */
export interface Container {
  /**
   * Create a new **child (request-scoped)** container.
   *
   * The child delegates lookups to this container (its parent) when
   * a binding is not found locally. Singleton bindings registered in the
   * parent remain shared; bindings added to the child are isolated to the
   * child’s lifetime.
   *
   * @returns A new child container.
   */
  createScope(): Container;

  /**
   * Bind an abstract identifier (symbol/interface) to a concrete class.
   * Returns a fluent API to configure its dependencies and lifetime.
   *
   * @example
   * container.bind<IDb>(DBToken).to(SqliteDb).inSingletonScope();
   */
  bind<T>(key: Identifier<T>): BindingToContract<T>;

  /**
   * Register a concrete class (constructor) directly in the container.
   * Returns a fluent API to configure constructor dependencies and lifetime.
   *
   * @example
   * container.put(UserService).with({ repo: UserRepository });
   */
  put<T>(ctor: Newable<T>): BindingWithInContract<T>;

  /**
   * Register a factory function that produces an instance each time
   * the dependency is resolved, unless the binding is marked as singleton.
   *
   * @param key - Identifier to bind.
   * @param factory - Function returning the instance.
   */
  toFactory<T>(key: Identifier<T>, factory: () => T): void;

  /**
   * Register a ready-made instance for the identifier.
   * The instance will be reused for all subsequent resolutions.
   *
   * @param key - Identifier for the instance.
   * @param value - The actual instance to store.
   */
  set<T>(key: Identifier<T>, value: T): void;

  /**
   * Resolve and return an instance for the given identifier.
   * Implementations must recursively resolve declared dependencies.
   *
   * @typeParam T - Expected instance type.
   * @param key - Identifier (token/class) to resolve.
   * @throws If the identifier is not registered in this container hierarchy.
   */
  get<T>(key: Identifier<T>): T;

  /**
   * Check whether an identifier is bound in this container or any parent.
   *
   * @param key - Identifier to check.
   * @returns `true` if found locally or in the parent chain.
   */
  has(key: Identifier): boolean;

  /**
   * Build and return a dependency graph for this container.
   * Useful for introspection and debugging.
   *
   * @param rootKey - Optional starting identifier (defaults to all local bindings).
   * @returns Dependency tree(s) describing how bindings reference each other.
   */
  getGraph(rootKey?: Identifier): DependencyNode[];

  /**
   * Print a visual representation of the dependency graph to the console.
   * Intended for developer diagnostics and debugging.
   *
   * @param rootKey - Optional starting identifier.
   */
  printGraph(rootKey?: Identifier): void;
}
