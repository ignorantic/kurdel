import type { HttpContext } from 'src/http/http-context.js';
import type { ActionResult } from 'src/http/action-result.js';

export type Middleware<TBody = unknown> = (
  ctx: HttpContext<TBody>,
  next: () => Promise<ActionResult | void>
) => Promise<ActionResult | void>;
