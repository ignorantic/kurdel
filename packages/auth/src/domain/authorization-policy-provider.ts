import type { Container } from '@kurdel/ioc';

import type { AuthorizationPolicy } from './authorization-policy.js';

export type AuthorizationPolicyProvider =
  | {
      name: string;
      use: AuthorizationPolicy;
    }
  | {
      name: string;
      useFactory: (container: Container) => AuthorizationPolicy;
    };
