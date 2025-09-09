import { Application } from '@kurdel/core';
import { UserController } from './controllers/user-controller.js';
import { PostController } from './controllers/post-controller.js';
import { UserService } from './services/user-service.js';
import { PostService } from './services/post-service.js';
import { loggerMiddleware } from './middlewares/logger.js';
import { authMiddleware } from './middlewares/auth.js';
const app = await Application.create({
    db: false,
    services: [PostService, UserService],
    middlewares: [loggerMiddleware],
    controllers: [
        {
            use: PostController,
            deps: { service: PostService }
        },
        {
            use: UserController,
            deps: {
                service: UserService
            },
            middlewares: [authMiddleware]
        },
    ]
});
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000\n`);
});
