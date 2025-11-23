import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule, MiddlewareRegistration } from '@kurdel/core/http';
import { schemaValidator } from '@kurdel/runtime/middlewares';

import { UserController } from './user-controller.js';
import { UserModel } from './user-model.js';

export class UserModule implements HttpModule<AppConfig> {
  readonly models = [UserModel];

  readonly controllers = [
    {
      use: UserController,
      deps: { model: UserModel },
      prefix: '/users',
    },
  ];

  readonly middlewares: MiddlewareRegistration[] = [
    { use: schemaValidator, zone: 'pre', priority: 1 },
  ];

  register() {}
}

