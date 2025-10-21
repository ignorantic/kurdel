import { AppConfig } from '@kurdel/core/app';
import { HttpModule } from '@kurdel/core/http';

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

  register() {}
}

