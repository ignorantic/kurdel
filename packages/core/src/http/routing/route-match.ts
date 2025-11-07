import type {
  Controller,
  HttpContext,
  Method,
  Middleware,
} from 'src/http/index.js';

export interface RouteMatch {
  controller: Controller<any>;
  method: Method;
  action: string;
  path: string;
  params: Record<string, string>;
  middlewares: Middleware<HttpContext>[];
  meta?: Record<string, any>;
}