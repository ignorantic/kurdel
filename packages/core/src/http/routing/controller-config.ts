import type { Newable } from '@kurdel/common';
import type { Identifier } from '@kurdel/ioc';

import type { Middleware, Controller } from 'src/http/index.js';

export interface ControllerConfig {
  /** Controller class */
  use: Newable<Controller<any>>;

  /** Dependencies to be injected from IoC */
  deps?: Record<string, Identifier>;

  /** Middlewares applied only to this controller */
  middlewares?: Middleware[];

  /** Optional route prefix applied to all controller routes */
  prefix?: string;
}
