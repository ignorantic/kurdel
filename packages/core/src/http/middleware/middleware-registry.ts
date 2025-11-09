import type { Newable } from '@kurdel/common';
import type {
  Controller,
  Middleware,
  MiddlewareRegistration,
  MiddlewareZone,
} from 'src/http/index.js';

export interface MiddlewareRegistry {
  use(
    mw: Middleware,
    opts?: {
      zone?: MiddlewareZone;
      priority?: number;
    }
  ): void;

  useFor(
    controller: Newable<Controller>,
    mw: Middleware,
    opts?: {
      zone?: MiddlewareZone;
      priority?: number;
      action?: string;
    }
  ): void;

  for(
    controller: Newable<Controller>,
    zone?: MiddlewareZone,
    action?: string
  ): MiddlewareRegistration[];

  all(zone?: MiddlewareZone): MiddlewareRegistration[];
}
