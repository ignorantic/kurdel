import { Application } from '@kurdel/core';
import { UserController } from './controllers/user-controller.js';
import { PostController } from './controllers/post-controller.js';
import { UserService } from './services/user-service.js';
import { PostService } from './services/post-service.js';
const loggerMiddleware = async (ctx, next) => {
    const start = Date.now();
    const result = await next();
    const ms = Date.now() - start;
    console.log(`${ctx.req.method} ${ctx.url.pathname} -> ${result.status} (${ms}ms)`);
    return result;
};
const authMiddleware = async (ctx, next) => {
    if (!ctx.req.headers['authorization']) {
        return { kind: 'json', status: 401, body: { error: 'Unauthorized' } };
    }
    return next();
};
const app = await Application.create({
    db: false,
    services: [PostService, UserService],
    middlewares: [loggerMiddleware],
    controllers: [
        [PostController, [PostService]],
        [UserController, [UserService], [authMiddleware]],
    ]
});
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000\n`);
});
