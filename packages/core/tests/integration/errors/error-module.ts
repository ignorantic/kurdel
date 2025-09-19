import { HttpModule } from '../../../src/modules/http-module.js';
import { ErrorController } from './error-controller.js';

export class ErrorModule implements HttpModule {
  readonly controllers = [{ use: ErrorController, prefix: '/err' }];
  async register() {}
}

