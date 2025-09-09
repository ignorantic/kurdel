import { Application, jsonBodyParser } from '@kurdel/core';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserModel } from './models/user-model.js';
const app = await Application.create({
    models: [UserModel],
    controllers: [
        {
            use: PingController
        },
        {
            use: UserController,
            deps: {
                model: UserModel
            },
            middlewares: [jsonBodyParser]
        },
    ]
});
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000\n`);
});
