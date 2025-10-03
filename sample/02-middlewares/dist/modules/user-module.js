import { UserController } from '../controllers/user-controller.js';
import { UserService } from '../services/user-service.js';
import { authMiddleware } from '../middlewares/auth.js';
export class UserModule {
    providers = [
        {
            provide: UserService,
            useClass: UserService,
            isSingleton: true,
        },
    ];
    controllers = [
        {
            use: UserController,
            deps: { service: UserService },
            middlewares: [authMiddleware],
            prefix: '/users',
        },
    ];
    async register() { }
}
