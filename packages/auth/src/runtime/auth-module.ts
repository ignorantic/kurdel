import type { Container } from '@kurdel/ioc';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import type { MiddlewareRegistry } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';

import {
  NoopAuthEventSink,
  type AuthEventSink,
  type AuthEventSinkProvider,
  type AuthStrategyProvider,
  type AuthorizationPolicyProvider,
} from 'src/domain/index.js';
import {
  AuthStrategyRegistry,
  AuthorizationPolicyRegistry,
  createAuthMiddleware,
} from 'src/runtime/index.js';
import { AUTH_TOKENS } from 'src/tokens.js';

/**
 * ## AuthModuleConfig
 *
 * Configures authentication infrastructure provided by `AuthModule`.
 *
 * Applications declare:
 * - authentication strategies
 * - authorization policies
 * - optional authentication event sink
 *
 * All configured components are registered once during application startup.
 */
export interface AuthModuleConfig {
  /** List of user-provided authentication strategies. */
  strategies?: AuthStrategyProvider[];
  /** List of named application authorization policies. */
  policies?: AuthorizationPolicyProvider[];
  /** Optional destination for sanitized authentication lifecycle events. */
  events?: AuthEventSinkProvider;
}

/**
 * ## AuthModule
 *
 * Registers the authentication runtime.
 *
 * Provides:
 * - AuthStrategyRegistry
 * - AuthorizationPolicyRegistry
 * - AuthEventSink
 * 
 * Registers:
 * - authentication middleware
 *
 * Responsibilities:
 * - register configured strategies
 * - register configured authorization policies
 * - register the authentication middleware
 * - expose authentication infrastructure through DI
 *
 * Guarantees:
 * - configured strategies are registered exactly once
 * - configured policies are registered exactly once
 * - authentication middleware is installed in the `auth` zone
 * - an `AuthEventSink` is always available
 *
 * Non-responsibilities:
 * - credential persistence
 * - authentication implementations
 * - authorization decisions
 * - user management
 */
export class AuthModule implements AppModule<AuthModuleConfig> {
  readonly priority = ModulePriority.Auth;
  
  readonly providers: ProviderConfig[];

  constructor(private readonly config: AuthModuleConfig = {}) {
    const eventSink = config.events;
    this.providers = [
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
      eventSink && 'useFactory' in eventSink
        ? {
            provide: AUTH_TOKENS.EventSink,
            useFactory: eventSink.useFactory,
            singleton: true,
          }
        : {
            provide: AUTH_TOKENS.EventSink,
            useInstance: eventSink?.use ?? new NoopAuthEventSink(),
          },
    ];
  }

  /**
   * Registers authentication runtime components.
   *
   * 1. Registers authentication strategies.
   * 2️. Registers authorization policies.
   * 3️. Installs the authentication middleware.
   */
  async register(ioc: Container): Promise<void> {
    const registry = ioc.get<AuthStrategyRegistry>(AUTH_TOKENS.StrategyRegistry);
    const policies = ioc.get<AuthorizationPolicyRegistry>(AUTH_TOKENS.PolicyRegistry);
    const events = ioc.get<AuthEventSink>(AUTH_TOKENS.EventSink);

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
    mwReg.use(createAuthMiddleware(registry, policies, events), {
      zone: 'auth',
      priority: 0,
    });
  }
}
