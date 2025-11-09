import type { Middleware } from 'src/http/index.js';

export type MiddlewareZone = 'pre' | 'post' | 'error' | 'final';

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
