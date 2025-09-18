import { HttpModule, ControllerConfig, AppConfig } from '@kurdel/core';
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

