import { Newable } from '@kurdel/common';
import { Identifier, ScopeType } from './types.js';
export declare class Binding<T> {
    boundEntity: Newable<T> | T | null;
    scope: ScopeType;
    cache: T | null;
    activated: boolean;
    depsMap?: Record<string, Identifier>;
    constructor();
}
//# sourceMappingURL=binding.d.ts.map