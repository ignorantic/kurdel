import type { Container } from '@kurdel/ioc';

import type { AuthorizationPolicy } from './authorization-policy.js';

/**
 * ## AuthorizationPolicyProvider
 *
 * Describes how an authorization policy is supplied to
 * {@link AuthModule}.
 *
 * Applications may provide either:
 * - an existing policy instance
 * - a factory that resolves the policy from the IoC container
 *
 * Each policy is registered under the specified name and can later be
 * referenced from route authorization metadata.
 */
export type AuthorizationPolicyProvider =
  | {
      /** Policy name used by route metadata. */
      name: string;

      /** Existing policy instance. */
      use: AuthorizationPolicy;
    }
  | {
      /** Policy name used by route metadata. */
      name: string;

      /** Factory that resolves the policy from the IoC container. */
      useFactory: (container: Container) => AuthorizationPolicy;
    };