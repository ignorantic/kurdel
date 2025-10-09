import type { Newable } from '@kurdel/common';

export type Identifier<T = unknown> = string | symbol | Newable<T>;
