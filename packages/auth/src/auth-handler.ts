import type { HttpContext, ActionResult } from '@kurdel/core/http';

import type { AuthStrategyRegistry } from 'src/auth-strategy-registry.js';

export async function authHandler(
  ctx: HttpContext,
  registry: AuthStrategyRegistry
): Promise<ActionResult | null> {
  const rule = ctx.route?.auth;

  // 1️⃣ Public route
  if (!rule || rule.public) return null;

  // 2️⃣ Strategy required but missing
  if (!rule.strategy) {
    return ctx.json(500, { error: 'Route requires a strategy but none provided' });
  }

  const strategy = registry.get(rule.strategy);
  if (!strategy) {
    return ctx.json(500, { error: `Auth strategy '${rule.strategy}' not registered` });
  }

  // 3️⃣ Authenticate
  const user = await strategy.authenticate(ctx.req);
  if (!user) {
    return ctx.json(401, { error: 'Unauthorized' });
  }

  (ctx as any).user = user;

  // 4️⃣ Role check
  if (rule.roles && !rule.roles.some(r => user.roles.includes(r))) {
    return ctx.json(403, { error: 'Forbidden' });
  }

  return null;
}
