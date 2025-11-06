import type { ModelList } from 'src/db/model.js';
import type { AppModule } from 'src/app/app-module.js';
import type { AppConfig } from 'src/app/app-config.js';

import type { Middleware, ControllerConfig } from 'src/http/index.js';

/**
 * HttpModule
 *
 * Extension of the base AppModule contract for modules
 * that operate in an HTTP context.
 *
 * Purpose:
 * - Declare a list of middleware provided by this module
 * - Declare a list of controllers provided by this module
 * - Declare a list of middleware provided by this module
 *
 * @example
 * ```ts
 * export class UserModule implements HttpModule {
 *   readonly models = [UserModel];
 *   readonly controllers = [UserController];
 *   readonly middlewares = [AuthMiddleware];
 *
 *   readonly providers = [
 *     { provide: UserService, useClass: UserService, isSingleton: true }
 *   ];
 *
 *   async register(ioc: IoCContainer) {
 *     // everything else is handled via providers
 *   }
 * }
 * ```
 */
export interface HttpModule<
  TConfig = AppConfig,
  out TReadable = unknown  
> extends AppModule<TConfig> {
  /**
   * Models that should be registered
   * through the ModelModule
   */
  readonly models?: ModelList;

  /**
   * Controllers that should be registered
   * through the ControllerModule
   */
  readonly controllers?: ControllerConfig[];

  /**
   * Middleware that should be registered
   * through the MiddlewareModule
   */
  readonly middlewares?: Middleware<unknown, TReadable>[];
}
