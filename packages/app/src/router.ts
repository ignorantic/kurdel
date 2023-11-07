import { Router } from 'ijon';
import { HomeController } from './controllers/home-controller.js';

const router = new Router();

const homeController = new HomeController();

router.get('/', homeController, 'index');
router.get('/about', homeController, 'about');

export { router };

