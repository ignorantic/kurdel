import { HttpModule } from 'src/api/http/http-module.js';
import { ErrorController } from './error-controller.js';

export class ErrorModule implements HttpModule {
  readonly controllers = [{ use: ErrorController, prefix: '/err' }];
  async register() {}
}

