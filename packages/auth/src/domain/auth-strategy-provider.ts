import type { Container } from '@kurdel/ioc';

import type { AuthStrategy } from 'src/domain/index.js';

export type AuthStrategyProvider =
  | {
      name: string;
      use: AuthStrategy;
    }
  | {
      name: string;
      useFactory: (c: Container) => AuthStrategy;
    };
