import { PostController } from '../controllers/post-controller.js';
import { PostService } from '../services/post-service.js';
export class PostModule {
    providers = [
        {
            provide: PostService,
            useClass: PostService,
            isSingleton: true,
        },
    ];
    controllers = [
        {
            use: PostController,
            deps: { service: PostService },
            prefix: '/posts',
        },
    ];
}
