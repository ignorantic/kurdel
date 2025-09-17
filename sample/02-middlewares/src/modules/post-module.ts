import { AppConfig, HttpModule } from '@kurdel/core';
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
}

