import { Router } from 'ijon';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserService } from './services/user-service.js';
import { SQLiteDB } from './db/sqlite-db.js';

const router = new Router();

const db = new SQLiteDB('./test.db');

const userService = new UserService(db);

const pingController = new PingController();
const userController = new UserController(userService);

router.useController(pingController);
router.useController(userController);

export { router };

