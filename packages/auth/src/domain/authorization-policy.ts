import type { AuthContext } from '@kurdel/common';
import type { HttpContext } from '@kurdel/core/http';

/**
 * ## AuthorizationDecision
 *
 * Result of an authorization policy evaluation.
 */
export type AuthorizationDecision = {
  /** Indicates whether access is granted. */
  allowed: boolean;

  /**
   * Safe, non-sensitive reason code suitable for audit events.
   *
   * This value is intended for diagnostics and should not expose
   * confidential application details.
   */
  reason?: string;
};

/**
 * Result returned by an authorization policy.
 *
 * Policies may return either a simple boolean or a richer
 * {@link AuthorizationDecision}.
 */
export type AuthorizationPolicyResult =
  | boolean
  | AuthorizationDecision;

/**
 * ## AuthorizationPolicy
 *
 * Contract implemented by application authorization policies.
 *
 * Policies evaluate an authenticated request and decide whether it
 * should be allowed to proceed.
 *
 * Policies should:
 * - remain deterministic
 * - avoid observable side effects
 * - return diagnostic reasons only when they are safe to expose
 */
export interface AuthorizationPolicy {
  /**
   * Evaluates whether the authenticated request is authorized.
   */
  authorize(
    auth: Readonly<AuthContext>,
    ctx: HttpContext,
  ): AuthorizationPolicyResult | Promise<AuthorizationPolicyResult>;
}

/**
 * Normalizes a policy result into an {@link AuthorizationDecision}.
 *
 * Boolean results are converted into the equivalent decision object.
 */
export function authorizationDecision(
  result: AuthorizationPolicyResult,
): AuthorizationDecision {
  return typeof result === 'boolean'
    ? { allowed: result }
    : result;
}