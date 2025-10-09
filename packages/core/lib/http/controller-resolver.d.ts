import type { Container } from '@kurdel/ioc';
import type { Controller } from './controller.js';
export interface ControllerResolver {
    get<T>(cls: new (...a: any[]) => T): T;
    resolve<T extends Controller = Controller>(token: unknown, scope: Container): T;
}
