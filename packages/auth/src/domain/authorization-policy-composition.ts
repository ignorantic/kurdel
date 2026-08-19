import type { AuthContext } from '@kurdel/common';
import type { HttpContext } from '@kurdel/core/http';

import {
  authorizationDecision,
  type AuthorizationDecision,
  type AuthorizationPolicy,
} from './authorization-policy.js';

/**
 * Evaluates a policy and normalizes its result into an
 * {@link AuthorizationDecision}.
 */
async function evaluate(
  policy: AuthorizationPolicy,
  auth: Readonly<AuthContext>,
  ctx: HttpContext,
): Promise<AuthorizationDecision> {
  return authorizationDecision(await policy.authorize(auth, ctx));
}

/**
 * Combines multiple authorization policies using logical AND.
 *
 * Access is granted only when every nested policy grants access.
 * Evaluation stops at the first denial.
 */
export function allOf(...policies: AuthorizationPolicy[]): AuthorizationPolicy {
  return {
    async authorize(auth, ctx) {
      for (const policy of policies) {
        const decision = await evaluate(policy, auth, ctx);
        if (!decision.allowed) return decision;
      }
      return { allowed: true };
    },
  };
}

/**
 * Combines multiple authorization policies using logical OR.
 *
 * Access is granted when any nested policy grants access.
 * When every policy denies access, the most informative denial
 * reason is preserved.
 */
export function anyOf(...policies: AuthorizationPolicy[]): AuthorizationPolicy {
  return {
    async authorize(auth, ctx) {
      let denied: AuthorizationDecision = { allowed: false };

      for (const policy of policies) {
        const decision = await evaluate(policy, auth, ctx);

        if (decision.allowed) return decision;
        if (decision.reason) denied = decision;
      }

      return denied;
    },
  };
}

/**
 * Inverts the result of an authorization policy.
 *
 * When the wrapped policy grants access, the returned policy denies
 * access. An optional denial reason may be supplied for the inverted
 * decision.
 */
export function not(
  policy: AuthorizationPolicy,
  reason?: string,
): AuthorizationPolicy {
  return {
    async authorize(auth, ctx) {
      const decision = await evaluate(policy, auth, ctx);

      return decision.allowed
        ? { allowed: false, ...(reason ? { reason } : {}) }
        : { allowed: true };
    },
  };
}