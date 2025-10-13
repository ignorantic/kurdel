import type { Container } from '@kurdel/ioc';

import type { Controller } from 'src/http/controller.js';

export interface ControllerResolver {
  resolve<T extends Controller = Controller>(token: unknown, scope?: Container): T;
}
