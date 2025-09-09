import { Newable } from '@kurdel/common';
export type Identifier<T = unknown> = string | symbol | Newable<T>;
export type ScopeType = 'Transient' | 'Singleton';
export type BindingType = 'Constructor' | 'Instance';
//# sourceMappingURL=types.d.ts.map