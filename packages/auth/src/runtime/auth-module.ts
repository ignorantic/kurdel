import type { Container } from '@kurdel/ioc';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import type { MiddlewareRegistry } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';

import type { AuthStrategyProvider } from 'src/domain/index.js';
import { AuthStrategyRegistry, createAuthMiddleware } from 'src/runtime/index.js';
import { InMemoryJwtRepository } from 'src/infra/index.js';
import { AUTH_TOKENS } from 'src/tokens.js';
import { JwtService } from 'src/strategies/index.js';

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
    {
      provide: AUTH_TOKENS.JwtRepository,
      useFactory: () => new InMemoryJwtRepository([
        { id: '1', roles: ['root'] },
        { id: '2', roles: ['admin'] },
        { id: '3', roles: ['user'] },
        { id: '4', roles: ['guest'] },
      ]),
      singleton: true,
    },
    {
      provide: AUTH_TOKENS.JwtService,
      useFactory: () => new JwtService({
        secret: 'dev-secret',
        issuer: 'kurdel',
        audience: 'sample-jwt',
        expiresIn: undefined, // verification only
      }),
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
      if ('use' in s) {
        registry.register(s.name, s.use);
      } else {
        const strategy = s.useFactory(ioc);
        registry.register(s.name, strategy);
      }
    }

    // register system auth middleware
    const mwReg = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    mwReg.use(createAuthMiddleware(registry), {
      zone: 'auth',
      priority: 0,
    });
  }
}
