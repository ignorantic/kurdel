import { Application, MiddlewareRegistry } from '@kurdel/core';
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
    controllers: [
        [PostController, [PostService]],
        [UserController, [UserService]],
    ]
});
const registry = app['ioc'].get(MiddlewareRegistry);
registry.use(loggerMiddleware);
registry.useFor(UserController, authMiddleware);
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000\n`);
});
