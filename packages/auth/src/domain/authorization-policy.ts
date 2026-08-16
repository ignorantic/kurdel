import type { AuthContext } from '@kurdel/common';
import type { HttpContext } from '@kurdel/core/http';

export type AuthorizationDecision = {
  allowed: boolean;
  /** Safe, non-sensitive reason code suitable for authorization audit events. */
  reason?: string;
};

export type AuthorizationPolicyResult = boolean | AuthorizationDecision;

/** Performs an application-specific authorization check for a request. */
export interface AuthorizationPolicy {
  authorize(
    auth: Readonly<AuthContext>,
    ctx: HttpContext,
  ): AuthorizationPolicyResult | Promise<AuthorizationPolicyResult>;
}

/** Converts a boolean-compatible policy result into a diagnostic decision. */
export function authorizationDecision(result: AuthorizationPolicyResult): AuthorizationDecision {
  return typeof result === 'boolean' ? { allowed: result } : result;
}
