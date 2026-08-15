import type { Container } from '@kurdel/ioc';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import type { MiddlewareRegistry } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';

import type { AuthStrategyProvider, AuthorizationPolicyProvider } from 'src/domain/index.js';
import {
  AuthStrategyRegistry,
  AuthorizationPolicyRegistry,
  createAuthMiddleware,
} from 'src/runtime/index.js';
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
  strategies?: AuthStrategyProvider[];
  /** List of named application authorization policies. */
  policies?: AuthorizationPolicyProvider[];
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
 * Identity repositories, credentials and strategy-specific services are
 * application concerns and must be supplied outside this module.
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
    {
      provide: AUTH_TOKENS.PolicyRegistry,
      useClass: AuthorizationPolicyRegistry,
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
    const policies = ioc.get<AuthorizationPolicyRegistry>(AUTH_TOKENS.PolicyRegistry);

    // register user strategies
    for (const s of this.config.strategies ?? []) {
      if ('use' in s) {
        registry.register(s.name, s.use);
      } else {
        const strategy = s.useFactory(ioc);
        registry.register(s.name, strategy);
      }
    }

    for (const policy of this.config.policies ?? []) {
      policies.register(
        policy.name,
        'use' in policy ? policy.use : policy.useFactory(ioc),
      );
    }

    // register system auth middleware
    const mwReg = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    mwReg.use(createAuthMiddleware(registry, policies), {
      zone: 'auth',
      priority: 0,
    });
  }
}
