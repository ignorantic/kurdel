import { Newable } from '@kurdel/common';
import { Identifier, ScopeType } from './types.js';
export declare class Binding<T> {
    boundEntity: Newable<T> | T | null;
    dependencies: Identifier[];
    scope: ScopeType;
    cache: T | null;
    activated: boolean;
    constructor();
}
