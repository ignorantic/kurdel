import { Newable } from '@kurdel/common';
import { Identifier, ScopeType } from './types.js';

/**
 * Binding
 *
 * Stores information about how a dependency is resolved:
 * - boundEntity → class or instance
 * - depsMap → dependencies for constructor injection
 * - toFactory → custom factory function
 * - scope → lifecycle (Transient or Singleton)
 * - cache → cached instance (for Singleton)
 */
export class Binding<T> {
  public boundEntity: Newable<T> | T | null;
  public depsMap?: Record<string, Identifier>;
  public toFactory?: () => T;
  public scope: ScopeType;
  public cache: T | null;
  public activated: boolean;

  constructor() {
    this.boundEntity = null;
    this.scope = 'Transient';
    this.cache = null;
    this.activated = false;
    this.depsMap = undefined;
    this.toFactory = undefined;
  }
}
