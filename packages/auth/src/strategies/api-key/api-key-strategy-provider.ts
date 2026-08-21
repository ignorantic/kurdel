import type { Container } from '@kurdel/ioc';

import type { AuthStrategyProvider } from '../../domain/auth-strategy-provider.js';
import type { ApiKeyUsageRecorder } from '../../repositories/api-key/api-key-usage-recorder.js';
import { AUTH_TOKENS } from '../../tokens.js';
import { ApiKeyStrategy } from './api-key-strategy.js';

/** Declarative options for the built-in API-key strategy provider. */
export interface ApiKeyStrategyProviderOptions {
  /** Request header containing the API key. @default "x-api-key" */
  header?: string;
  /** Enables usage recording or supplies a custom recorder. */
  usage?: boolean | ApiKeyUsageRecorder;
  /** Injectable clock for deterministic expiration behavior. */
  now?: () => Date;
}

/**
 * Creates a DI-backed API-key authentication strategy provider.
 *
 * Credential and user repositories are resolved from the application
 * container. Set `usage` to `true` to resolve the registered usage recorder.
 */
export function apiKeyStrategy(
  options: ApiKeyStrategyProviderOptions = {},
): AuthStrategyProvider {
  return {
    name: 'api-key',
    useFactory(container: Container) {
      const { usage, ...strategyOptions } = options;
      return new ApiKeyStrategy({
        header: strategyOptions.header ?? 'x-api-key',
        credentials: container.get(AUTH_TOKENS.ApiKeyRepository),
        users: container.get(AUTH_TOKENS.UserRepository),
        ...(usage
          ? {
              usage: usage === true
                ? container.get(AUTH_TOKENS.ApiKeyUsageRecorder)
                : usage,
            }
          : {}),
        ...(strategyOptions.now ? { now: strategyOptions.now } : {}),
      });
    },
  };
}
