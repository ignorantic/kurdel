import type { Middleware } from 'src/http/index.js';

/**
 * Middleware execution zones in the Kurdel runtime pipeline.
 *
 * Now includes:
 * - `auth`  → executes after validation, before PRE
 * - `pre`   → before controller
 * - `post`  → after render
 * - `error` → on exceptions
 * - `final` → always
 */
export type MiddlewareZone = 'auth' | 'pre' | 'post' | 'error' | 'final';

/**
 * Describes a single middleware registration entry.
 *
 * - `zone`: execution stage (`pre`, `post`, `error`, or `final`)
 * - `priority`: numeric priority (lower runs first)
 * - `action`: optional controller action this middleware applies to
 */
export interface MiddlewareRegistration {
  readonly use: Middleware;
  readonly zone: MiddlewareZone;
  readonly priority: number;
  readonly action?: string;
}
