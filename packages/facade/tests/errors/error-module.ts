import type { HttpModule } from '@kurdel/core/http';

import { ErrorController } from './error-controller.js';

export class ErrorModule implements HttpModule {
  readonly controllers = [{ use: ErrorController, prefix: '/err' }];
  async register() {}
}
