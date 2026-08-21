import type { Container } from '@kurdel/ioc';

import type { AuthStrategyProvider } from '../../domain/auth-strategy-provider.js';
import type { JwtSessionRepository } from '../../repositories/jwt/jwt-session-repository.js';
import { AUTH_TOKENS } from '../../tokens.js';
import { JwtStrategy, type JwtStrategyOptions } from './jwt-strategy.js';

/** Declarative options for the built-in JWT strategy provider. */
export type JwtStrategyProviderOptions = Omit<JwtStrategyOptions, 'sessions'> & {
  /**
   * Enables server-side session validation or supplies a custom repository.
   * Set to `true` to resolve the registered repository from the container.
   */
  sessions?: boolean | JwtSessionRepository;
};

/**
 * Creates a DI-backed JWT authentication strategy provider.
 *
 * The application only declares transport and session behavior. Framework
 * services and the current-user repository are resolved from the container.
 */
export function jwtStrategy(
  options: JwtStrategyProviderOptions = {},
): AuthStrategyProvider {
  return {
    name: 'jwt',
    useFactory(container: Container) {
      const { sessions, ...strategyOptions } = options;
      return new JwtStrategy(
        container.get(AUTH_TOKENS.JwtService),
        container.get(AUTH_TOKENS.UserRepository),
        {
          ...strategyOptions,
          ...(sessions
            ? {
                sessions: sessions === true
                  ? container.get(AUTH_TOKENS.JwtSessionRepository)
                  : sessions,
              }
            : {}),
        },
      );
    },
  };
}
