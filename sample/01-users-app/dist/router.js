import { Router, DatabaseFactory, IoCContainer } from 'ijon';
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
const container = new IoCContainer();
const router = new Router();
container.registerInstance('db', db);
container.registerInstance('router', router);
container.register('UserService', UserService, ['db']);
container.register('UserController', UserController, ['UserService']);
container.register('PingController', PingController, []);
const userController = container.resolve('UserController');
const pingController = container.resolve('PingController');
router.useController(pingController);
router.useController(userController);
export default container;
