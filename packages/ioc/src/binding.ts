import { Newable } from '@kurdel/common';
import { Identifier, ScopeType } from './types.js';

export class Binding<T> {
  public boundEntity: Newable<T> | T | null;
  public scope: ScopeType;
  public cache: T | null;
  public activated: boolean;
  public depsMap?: Record<string, Identifier>;

  constructor() {
    this.boundEntity = null;
    this.scope = 'Transient';
    this.cache = null;
    this.activated = false;
    this.depsMap = undefined;
  }
}
