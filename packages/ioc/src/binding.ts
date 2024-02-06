import { Newable } from '@kurdel/common';
import { Identifier, ScopeType } from './types.js';

export class Binding<T> {
  public boundEntity: Newable<T> | T | null;
  public dependencies: Identifier[];
  public scope: ScopeType;
  public cache: T | null;
  public activated: boolean;

  constructor() {
    this.boundEntity = null;
    this.dependencies = [];
    this.scope = 'Transient';
    this.cache = null;
    this.activated = false;
  }
}
