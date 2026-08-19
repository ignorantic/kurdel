import type { Middleware } from '@kurdel/core/http';
import {
  authorizationDecision,
  NoopAuthEventSink,
  type AuthContext,
  type AuthEventSink,
} from 'src/domain/index.js';

import type { AuthStrategyRegistry } from './auth-strategy-registry.js';
import { AuthorizationPolicyRegistry } from './authorization-policy-registry.js';

/**
 * ## createAuthMiddleware
 *
 * Creates the authentication and authorization middleware.
 *
 * Responsibilities:
 * - authenticate incoming requests
 * - populate `HttpContext.auth` and `HttpContext.user`
 * - enforce route role requirements
 * - evaluate configured authorization policies
 * - emit sanitized authentication lifecycle events
 *
 * Guarantees:
 * - authentication executes before authorization
 * - route handlers execute only after successful authorization
 * - authentication events are emitted in execution order
 * - authorization policies execute sequentially
 *
 * Non-responsibilities:
 * - credential persistence
 * - user management
 * - session management
 *
 * Pipeline:
 *
 * 1. Skip public routes.
 * 2. Authenticate using the configured strategy.
 * 3. Populate the authentication context.
 * 4. Validate required roles.
 * 5. Evaluate authorization policies.
 * 6. Continue the middleware pipeline.
 */
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

    // ---------------------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------------------
    
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

    // ---------------------------------------------------------------------
    // 2. Role authorization
    // ---------------------------------------------------------------------

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

    // ---------------------------------------------------------------------
    // 3. Policy authorization
    // ---------------------------------------------------------------------

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

        const decision = authorizationDecision(await policy.authorize(auth, ctx));
        if (!decision.allowed) {
          await events.report({
            type: 'authorization.denied',
            occurredAt: now(),
            strategy: auth.strategy,
            userId: auth.user.id,
            ...(auth.credential ? { credential: auth.credential } : {}),
            reason: 'policy-rejected',
            policy: name,
            ...(decision.reason ? { decisionReason: decision.reason } : {}),
          });
          return ctx.json(403, { error: 'Forbidden' });
        }
      }
    }

    return next();
  };
}
