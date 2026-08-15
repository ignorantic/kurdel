import type { AuthContext } from '@kurdel/common';
import type { HttpContext } from '@kurdel/core/http';

/** Performs an application-specific authorization check for a request. */
export interface AuthorizationPolicy {
  authorize(auth: Readonly<AuthContext>, ctx: HttpContext): boolean | Promise<boolean>;
}
