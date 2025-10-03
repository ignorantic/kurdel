import { UserController } from './user-controller.js';
import { UserModel } from './user-model.js';
export class UserModule {
    models = [UserModel];
    controllers = [
        {
            use: UserController,
            deps: { model: UserModel },
            prefix: '/users',
        },
    ];
    async register() { }
}
