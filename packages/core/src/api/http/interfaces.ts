import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';

import { Middleware } from 'src/api/http/middleware.js';
import { Controller } from 'src/api/http/controller.js';

export interface RequestLike { method?: string; url?: string }

export interface ResponseLike { statusCode?: number; end?(body?: unknown): void }

export interface ServerAdapter<R = RequestLike, S = ResponseLike> {
  on(handler: (req: R, res: S) => void | Promise<void>): void;
  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void | Promise<void>;
  close?(): Promise<void>;
  raw?<T = unknown>(): T | undefined;
  url?(): string;
}

export interface RunningServer {
  /** e.g. http://127.0.0.1:3000 */
  url?: string;
  /** Graceful shutdown */
  close(): Promise<void>;
  /** Escape hatch for tests (e.g., Node http.Server) */
  raw?<T = unknown>(): T | undefined;
}

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

