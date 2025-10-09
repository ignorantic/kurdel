import type { Newable } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type { ControllerResolver } from '@kurdel/core/http';
export declare class RuntimeControllerResolver implements ControllerResolver {
    private readonly root;
    constructor(root: Container);
    /**
     * Resolve controller instance from the provided request scope.
     * Falls back to the root container when not registered in the scope.
     */
    resolve<T>(cls: Newable<T>, scope: Container): T;
    /** @deprecated kept for backward-compat; prefer resolve(cls, scope) */
    get<T>(cls: Newable<T>): T;
}
