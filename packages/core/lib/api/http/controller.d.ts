import { ServerResponse, IncomingMessage } from 'http';
import type { ActionResult } from './types.js';
import type { Middleware } from './middleware.js';
import type { RouteConfig } from './route.ts';
export declare abstract class Controller<TDeps = unknown> {
    protected readonly deps: TDeps;
    constructor(deps: TDeps);
    abstract readonly routes: RouteConfig<TDeps>;
    private middlewares;
    use(mw: Middleware<TDeps>): void;
    execute(req: IncomingMessage, res: ServerResponse, actionName: string, globalMiddlewares?: Middleware<TDeps>[]): Promise<void>;
    protected render(res: ServerResponse, r: ActionResult): void;
}
