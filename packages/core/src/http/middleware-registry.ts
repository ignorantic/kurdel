import type { Middleware } from './middleware.js';

export interface MiddlewareRegistry {
  use(mw: Middleware): void;
  // eslint-disable-next-line
  useFor(target: Function, mw: Middleware): void;
  all(): Middleware[];
}
