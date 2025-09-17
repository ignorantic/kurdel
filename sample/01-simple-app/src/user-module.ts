import { AppConfig, HttpModule } from '@kurdel/core';
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
}

