import type { Middleware } from '@kurdel/core/http';
import type { AuthContext } from 'src/domain/index.js';

import type { AuthStrategyRegistry } from 'src/runtime/index.js';

export function createAuthMiddleware(registry: AuthStrategyRegistry): Middleware {
  return async (ctx, next) => {
    const meta = ctx.route?.auth;
    if (!meta || meta.public) {
      // public route
      return next();
    }

    const { strategy, roles } = meta;

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

    return next();
  };
}
