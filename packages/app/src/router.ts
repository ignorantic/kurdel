import { Router } from 'ijon';
import { HomeController } from './controllers/home-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserService } from './services/user-service.js';
import { SQLiteDB } from './db/sqlite-db.js';

const router = new Router();

const db = new SQLiteDB('./test.db');

const userService = new UserService(db);

const homeController = new HomeController();
const userController = new UserController(userService);

router.get('/', homeController, 'index');
router.get('/about', homeController, 'about');
router.get('/create', userController, 'create');
router.get('/user', userController, 'getOne');
router.get('/users', userController, 'getAll');

export { router };

