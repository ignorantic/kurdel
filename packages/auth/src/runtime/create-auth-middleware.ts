import type { Middleware } from '@kurdel/core/http';
import { NoopAuthEventSink, type AuthContext, type AuthEventSink } from 'src/domain/index.js';

import type { AuthStrategyRegistry } from './auth-strategy-registry.js';
import { AuthorizationPolicyRegistry } from './authorization-policy-registry.js';

export function createAuthMiddleware(
  registry: AuthStrategyRegistry,
  policies: AuthorizationPolicyRegistry = new AuthorizationPolicyRegistry(),
  events: AuthEventSink = new NoopAuthEventSink(),
  now: () => Date = () => new Date(),
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
        await events.report({
          type: 'authentication.failed',
          occurredAt: now(),
          strategy,
          reason: 'invalid-credential',
        });
        return ctx.json(401, { error: 'Unauthorized' });
      }

      auth = {
        ...result,
        strategy,
      };
      ctx.auth = auth;
      ctx.user = result.user;
      await events.report({
        type: 'authentication.succeeded',
        occurredAt: now(),
        strategy,
        userId: auth.user.id,
        ...(auth.credential ? { credential: auth.credential } : {}),
      });
    }

    // --- 2️⃣ Authorize ---
    if (roles && roles.length > 0) {
      const ok = auth && Array.isArray(auth.user.roles)
        ? roles.some(r => auth.user.roles.includes(r))
        : false;

      if (!ok) {
        await events.report({
          type: 'authorization.denied',
          occurredAt: now(),
          ...(auth ? { strategy: auth.strategy, userId: auth.user.id } : {}),
          ...(auth?.credential ? { credential: auth.credential } : {}),
          reason: 'missing-role',
        });
        return ctx.json(403, { error: 'Forbidden' });
      }
    }

    if (requiredPolicies && requiredPolicies.length > 0) {
      if (!auth) {
        await events.report({
          type: 'authorization.denied',
          occurredAt: now(),
          reason: 'missing-authentication',
        });
        return ctx.json(403, { error: 'Forbidden' });
      }

      for (const name of requiredPolicies) {
        const policy = policies.get(name);
        if (!policy) {
          return ctx.json(500, { error: `Unknown authorization policy '${name}'` });
        }

        if (!(await policy.authorize(auth, ctx))) {
          await events.report({
            type: 'authorization.denied',
            occurredAt: now(),
            strategy: auth.strategy,
            userId: auth.user.id,
            ...(auth.credential ? { credential: auth.credential } : {}),
            reason: 'policy-rejected',
            policy: name,
          });
          return ctx.json(403, { error: 'Forbidden' });
        }
      }
    }

    return next();
  };
}
