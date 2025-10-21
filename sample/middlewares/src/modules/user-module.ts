import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule } from '@kurdel/core/http';

import { UserController } from '../controllers/user-controller.js';
import { UserService } from '../services/user-service.js';
import { authMiddleware } from '../middlewares/auth.js';

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
      middlewares: [authMiddleware],
      prefix: '/users',
    },
  ];

  async register() {}
}

