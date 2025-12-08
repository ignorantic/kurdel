import type { Middleware } from '@kurdel/core/http';

import type { AuthStrategyRegistry } from 'src/auth-strategy-registry.js';

export function createAuthMiddleware(registry: AuthStrategyRegistry): Middleware {
  return async (ctx, next) => {
    const meta = ctx.route?.auth;
    if (!meta) {
      // public route
      return next();
    }

    const { strategy, roles } = meta;

    // --- 1️⃣ Authenticate ---
    let user: any = undefined;

    if (strategy) {
      const strat = registry.get(strategy);
      if (!strat) {
        return ctx.json(500, { error: `Unknown auth strategy '${strategy}'` });
      }

      user = await strat.authenticate(ctx.req);
      if (!user) {
        return ctx.json(401, { error: 'Unauthorized' });
      }

      ctx.user = user;
    }

    // --- 2️⃣ Authorize ---
    if (roles && roles.length > 0) {
      const ok = user && Array.isArray(user.roles)
        ? roles.some(r => user.roles.includes(r))
        : false;

      if (!ok) {
        return ctx.json(403, { error: 'Forbidden' });
      }
    }

    return next();
  };
}
