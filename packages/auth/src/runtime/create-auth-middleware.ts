import type { Middleware } from '@kurdel/core/http';
import type { AuthContext } from 'src/domain/index.js';

import type { AuthStrategyRegistry } from './auth-strategy-registry.js';
import { AuthorizationPolicyRegistry } from './authorization-policy-registry.js';

export function createAuthMiddleware(
  registry: AuthStrategyRegistry,
  policies: AuthorizationPolicyRegistry = new AuthorizationPolicyRegistry(),
): Middleware {
  return async (ctx, next) => {
    const meta = ctx.route?.auth;
    if (!meta || meta.public) {
      // public route
      return next();
    }

    const { strategy, roles, policies: requiredPolicies } = meta;

    // --- 1️⃣ Authenticate ---
    let auth: AuthContext | undefined;

    if (strategy) {
      const strat = registry.get(strategy);
      if (!strat) {
        return ctx.json(500, { error: `Unknown auth strategy '${strategy}'` });
      }

      const result = await strat.authenticate(ctx.req);
      if (!result) {
        return ctx.json(401, { error: 'Unauthorized' });
      }

      auth = {
        ...result,
        strategy,
      };
      ctx.auth = auth;
      ctx.user = result.user;
    }

    // --- 2️⃣ Authorize ---
    if (roles && roles.length > 0) {
      const ok = auth && Array.isArray(auth.user.roles)
        ? roles.some(r => auth.user.roles.includes(r))
        : false;

      if (!ok) {
        return ctx.json(403, { error: 'Forbidden' });
      }
    }

    if (requiredPolicies && requiredPolicies.length > 0) {
      if (!auth) {
        return ctx.json(403, { error: 'Forbidden' });
      }

      for (const name of requiredPolicies) {
        const policy = policies.get(name);
        if (!policy) {
          return ctx.json(500, { error: `Unknown authorization policy '${name}'` });
        }

        if (!(await policy.authorize(auth, ctx))) {
          return ctx.json(403, { error: 'Forbidden' });
        }
      }
    }

    return next();
  };
}
