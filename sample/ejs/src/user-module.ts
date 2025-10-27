import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule } from '@kurdel/core/http';

import { UserController } from './user-controller.js';
import { UserService } from './user-service.js';

export class UserModule implements HttpModule<AppConfig> {
  readonly providers = [
    {
      provide: UserService,
      useClass: UserService,
      isSingleton: true,
    },
  ];

  readonly controllers = [
    {
      use: UserController,
      deps: { service: UserService },
      prefix: '/users',
    },
  ];

  async register() {}
}

