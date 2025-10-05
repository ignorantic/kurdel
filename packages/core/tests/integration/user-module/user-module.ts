import { AppConfig } from 'src/api/app/config.js';
import { HttpModule } from 'src/api/http-module.js';
import { ControllerConfig } from 'src/api/http/interfaces.js';

import { UserService } from './user-service.js';
import { UserController } from './user-controller.js';

export class UserModule implements HttpModule<AppConfig> {
  readonly providers = [
    { provide: UserService, useClass: UserService, isSingleton: true },
  ];

  readonly controllers: ControllerConfig[] = [
    {
      use: UserController,
      deps: { userService: UserService },
      prefix: '/users',
    },
  ];

  readonly middlewares = [];

  async register() {}
}

