import type { Newable } from '@kurdel/common';
import type { Identifier } from '@kurdel/ioc';
import type { Controller, Middleware } from 'src/http/index.js';
import type { MiddlewareRegistration } from '@kurdel/core/http';

/**
 * Declares how a controller should be registered and instantiated.
 */
export interface ControllerConfig {
  /** Controller class */
  use: Newable<Controller<any>>;

  /** Dependencies to be injected from IoC */
  deps?: Record<string, Identifier>;

  /**
   * Middlewares applied to this controller or its specific actions.
   *
   * Each entry can be either:
   * - A raw `Middleware` (shorthand for `{ middleware, zone: 'pre', priority: 0 }`)
   * - A structured `MiddlewareRegistration` with zone, priority, and action.
   */
  middlewares?: Array<Middleware | MiddlewareRegistration>;

  /** Optional route prefix applied to all controller routes */
  prefix?: string;
}
