import { loggerMiddleware } from '../middlewares/logger.js';
export class LoggerModule {
    middlewares = [loggerMiddleware];
    register() { }
}
