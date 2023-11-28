import { Application, AppConfig } from 'ijon';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserModel } from './models/user-model.js';

const config: AppConfig = {
  port: 3000,
  database: {
    type: 'sqlite',
    filename: './test.db',
    user: '',
    password: '',
    host: '',
    port: 8888,
  },
  models: [UserModel],
  controllers: [
    [PingController, []],
    [UserController, [UserModel]],
  ]
};

const app = new Application(config);

app.start();

