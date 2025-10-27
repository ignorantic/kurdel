import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule } from '@kurdel/core/http';

import { HelloController } from './hello-controller.js';

export class HelloModule implements HttpModule<AppConfig> {
  readonly controllers = [
    {
      use: HelloController,
      prefix: '/',
    },
  ];

  async register() {}
}

