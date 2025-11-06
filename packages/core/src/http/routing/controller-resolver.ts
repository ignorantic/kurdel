import type { Container } from '@kurdel/ioc';

import type { Controller } from 'src/http/index.js';

export interface ControllerResolver {
  resolve<T extends Controller = Controller>(token: unknown, scope?: Container): T;
}
