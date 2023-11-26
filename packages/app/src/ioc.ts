import { Router, IoCContainer } from 'ijon';
import { PingController } from './controllers/ping-controller.js';
import { UserController } from './controllers/user-controller.js';
import { UserService } from './services/user-service.js';

const ioc = new IoCContainer();

ioc.register('UserService', UserService, ['db']);
ioc.register('PingController', PingController, []);
ioc.register('UserController', UserController, ['UserService']);
ioc.register('Router', Router, [
  'PingController',
  'UserController',
]);

export default ioc;

