import type { HttpContext } from './http-context.js';
import type { ActionResult } from './types.js';

export type Middleware<TBody = unknown> = (
  ctx: HttpContext<TBody>,
  next: () => Promise<ActionResult>
) => Promise<ActionResult>;
