import type { Controller, Method, RouteSchema } from 'src/http/index.js';

export interface RouteMatch {
  controller: Controller<any>;
  method: Method;
  action: string;
  path: string;
  params: Record<string, string>;
  schema?: RouteSchema;
}
