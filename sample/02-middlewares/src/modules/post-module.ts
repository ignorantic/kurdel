import { AppConfig } from '@kurdel/core/app';
import { HttpModule } from '@kurdel/core/http';

import { PostController } from '../controllers/post-controller.js';
import { PostService } from '../services/post-service.js';

export class PostModule implements HttpModule<AppConfig> {
  readonly providers = [
    {
      provide: PostService,
      useClass: PostService,
      isSingleton: true,
    },
  ];

  readonly controllers = [
    {
      use: PostController,
      deps: { service: PostService },
      prefix: '/posts',
    },
  ];

  async register() {}
}

