import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule } from '@kurdel/core/http';

import { HomeController } from './home-controller.js';

export class HomeModule implements HttpModule<AppConfig> {
  readonly controllers = [
    {
      use: HomeController,
      prefix: '/',
    },
  ];

  async register() {}
}

