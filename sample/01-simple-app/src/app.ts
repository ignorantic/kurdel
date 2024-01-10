import { Application } from '@kurdel/common';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserModel } from './models/user-model.js';

const app = await Application.create({
  models: [UserModel],
  controllers: [
    [PingController, []],
    [UserController, [UserModel]],
  ]
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});

