import { Newable } from '@kurdel/common';
import { Container } from '@kurdel/ioc';
import { ControllerResolver } from '../../api/http/interfaces.js';
export declare class IoCControllerResolver implements ControllerResolver {
    private readonly container;
    constructor(container: Container);
    get<T>(cls: Newable<T>): T;
}
