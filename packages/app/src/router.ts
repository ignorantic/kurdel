import { Router, DatabaseFactory } from 'ijon';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserService } from './services/user-service.js';

const driver = DatabaseFactory.createDriver({
  type: 'sqlite',
  filename: './test.db',
  user: '',
  password: '',
  host: '',
  port: 8888,
});

await driver.connect();

const db = driver.getDB();

if (!db) {
  throw new Error('Database not connected');
}

const userService = new UserService(db);

const pingController = new PingController();
const userController = new UserController(userService);

const router = new Router();

router.useController(pingController);
router.useController(userController);

export { router };

