import { Container } from '@kurdel/ioc';
import { Newable } from '@kurdel/common';
import { ControllerResolver } from '../api/types.js';
export declare class IoCControllerResolver implements ControllerResolver {
    private readonly container;
    constructor(container: Container);
    get<T>(cls: Newable<T>): T;
}
