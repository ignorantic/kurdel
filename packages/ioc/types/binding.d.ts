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
export declare class Binding<T> {
    boundEntity: Newable<T> | T | null;
    depsMap?: Record<string, Identifier>;
    toFactory?: () => T;
    scope: ScopeType;
    cache: T | null;
    activated: boolean;
    constructor();
}
//# sourceMappingURL=binding.d.ts.map