import type { Container } from '@kurdel/ioc';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import type { MiddlewareRegistry } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';

import type { AuthStrategy } from 'src/auth-strategy.js';
import { AuthStrategyRegistry } from 'src/auth-strategy-registry.js';
import { createAuthMiddleware } from 'src/middleware/create-auth-middleware.js';
import { AUTH_TOKENS } from 'src/tokens.js';

/**
 * ## AuthModuleConfig
 *
 * Defines authentication strategies supplied by the application.
 *
 * Example:
 * ```ts
 * new AuthModule({
 *   strategies: [
 *     { name: 'api-key', use: new ApiKeyStrategy({...}) },
 *     { name: 'jwt', use: new JwtStrategy({...}) },
 *   ]
 * })
 * ```
 *
 * Strategies are registered **once** during module initialization.
 */
export interface AuthModuleConfig {
  /** List of user-provided authentication strategies. */
  strategies?: Array<{
    /** Strategy lookup key (e.g. `"api-key"`, `"jwt"`). */
    name: string;

    /** A concrete strategy instance implementing AuthStrategy. */
    use: AuthStrategy;
  }>;
}

/**
 * ## AuthModule
 *
 * Provides:
 * - singleton `AuthStrategyRegistry`
 * - automatic registration of configured strategies
 *
 * Responsibilities:
 * - expose a DI-managed registry storing all auth strategies
 * - populate it during `register()`
 *
 * Non-responsibilities:
 * - no transport logic
 * - no middleware ordering
 * - no policy evaluation
 *
 * This module merely supplies building blocks used by
 * `authenticate()` and `authorize()` middleware factories.
 */
export class AuthModule implements AppModule<AuthModuleConfig> {
  readonly priority = ModulePriority.Auth;
  
  /**
   * Providers exposed by the module.
   *
   * - `StrategyRegistry` → a singleton container of auth strategies
   */
  readonly providers: ProviderConfig[] = [
    {
      provide: AUTH_TOKENS.StrategyRegistry,
      useClass: AuthStrategyRegistry,
      singleton: true,
    },
  ];

  constructor(private readonly config: AuthModuleConfig = {}) {}

  /**
   * Registers all configured authentication strategies.
   *
   * Called once during app startup.
   */
  async register(ioc: Container) {
    const registry = ioc.get<AuthStrategyRegistry>(AUTH_TOKENS.StrategyRegistry);

    // register user strategies
    for (const s of this.config.strategies ?? []) {
      registry.register(s.name, s.use);
    }

    // register system auth middleware
    const mwReg = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    mwReg.use(createAuthMiddleware(registry), {
      zone: 'auth',
      priority: 0,
    });
  }
}
