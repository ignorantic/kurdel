import type { HttpContext, ActionResult } from 'src/http/index.js';

export type Middleware<TBody = unknown, TReadable = unknown > = (
  ctx: HttpContext<TBody>,
  next: () => Promise<ActionResult<any> | void>
) => Promise<ActionResult<TReadable> | void>;
