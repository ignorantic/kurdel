import { Newable } from '@kurdel/common';
import { Container } from '@kurdel/ioc';
import { ControllerResolver } from '../../api/http/controller-resolver.js';
export declare class ControllerResolverImpl implements ControllerResolver {
    private readonly container;
    constructor(container: Container);
    get<T>(cls: Newable<T>): T;
}
