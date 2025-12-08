import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule } from '@kurdel/core/http';

import { PublicController } from './public-controller.js';
import { MixedController } from './mixed-controller.js';
import { SecureController } from './secure-controller.js';

export class DemoAuthModule implements HttpModule<AppConfig> {
  readonly controllers = [
    {
      use: PublicController,
      prefix: '/',
    },
    {
      use: MixedController,
      prefix: '/mixed',
    },
    {
      use: SecureController,
      prefix: '/secure',
      auth: {
        strategy: 'api-key',
        roles: ['root'],
      },
    },
  ];

  async register() {}
}
