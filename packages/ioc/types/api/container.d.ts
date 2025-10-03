import { Newable } from '@kurdel/common';
import type { Identifier } from './identifier.js';
export interface BindingToContract<T> {
    to(impl: Newable<T>): BindingWithInContract<T>;
    toInstance(value: T): void;
}
export interface BindingWithInContract<T> {
    with(deps: Record<string, Identifier<T>>): this;
    inSingletonScope(): this;
}
export interface Container {
    bind<T>(key: Identifier<T>): BindingToContract<T>;
    put<T>(ctor: Newable<T>): BindingWithInContract<T>;
    toFactory<T>(key: Identifier<T>, factory: () => T): void;
    get<T>(key: Identifier<T>): T;
    has(key: Identifier): boolean;
}
//# sourceMappingURL=container.d.ts.map