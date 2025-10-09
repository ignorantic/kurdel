import type { HttpContext } from './http-context.js';
import type { ActionResult } from './types.js';
export type Middleware<TDeps = unknown, TBody = unknown> = (ctx: HttpContext<TDeps, TBody>, next: () => Promise<ActionResult>) => Promise<ActionResult>;
