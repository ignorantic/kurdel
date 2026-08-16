import type { AuthContext } from '@kurdel/common';
import type { HttpContext } from '@kurdel/core/http';

import {
  authorizationDecision,
  type AuthorizationDecision,
  type AuthorizationPolicy,
} from './authorization-policy.js';

async function evaluate(
  policy: AuthorizationPolicy,
  auth: Readonly<AuthContext>,
  ctx: HttpContext,
): Promise<AuthorizationDecision> {
  return authorizationDecision(await policy.authorize(auth, ctx));
}

/** Grants access only when every nested policy grants access. */
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

/** Grants access when at least one nested policy grants access. */
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

/** Inverts a nested policy and uses the supplied reason when inversion denies access. */
export function not(policy: AuthorizationPolicy, reason?: string): AuthorizationPolicy {
  return {
    async authorize(auth, ctx) {
      const decision = await evaluate(policy, auth, ctx);
      return decision.allowed
        ? { allowed: false, ...(reason ? { reason } : {}) }
        : { allowed: true };
    },
  };
}
