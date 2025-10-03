import { Newable } from '@kurdel/common';
import { Identifier } from '../api/identifier.js';
import { ScopeType } from '../api/types.js';
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
export declare class Binding<T> {
    boundEntity: Newable<T> | T | null;
    depsMap?: Record<string, Identifier>;
    toFactory?: () => T;
    scope: ScopeType;
    cache: T | null;
    activated: boolean;
    constructor();
}
