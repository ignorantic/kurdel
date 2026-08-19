import type { Container } from '@kurdel/ioc';

import type { AuthStrategy } from 'src/domain/index.js';

/**
 * ## AuthStrategyProvider
 *
 * Describes how an authentication strategy is supplied to
 * {@link AuthModule}.
 *
 * Applications may provide either:
 * - an existing strategy instance
 * - a factory that resolves the strategy from the IoC container
 *
 * Each strategy is registered under the specified name and can later be
 * referenced from route authentication metadata.
 */
export type AuthStrategyProvider =
  | {
      /** Strategy name used by route metadata. */
      name: string;
      /** Existing strategy instance. */
      use: AuthStrategy;
    }
  | {
      /** Strategy name used by route metadata. */
      name: string;
      /** Factory that resolves the strategy from the IoC container. */
      useFactory: (c: Container) => AuthStrategy;
    };