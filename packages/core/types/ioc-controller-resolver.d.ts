import type { IoCContainer } from '@kurdel/ioc';
import type { Newable } from '@kurdel/common';
import { ControllerResolver } from './api/types.js';
export declare class IoCControllerResolver implements ControllerResolver {
    private readonly container;
    constructor(container: IoCContainer);
    get<T>(cls: Newable<T>): T;
}
//# sourceMappingURL=ioc-controller-resolver.d.ts.map