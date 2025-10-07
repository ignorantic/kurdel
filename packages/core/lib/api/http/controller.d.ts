import { ServerResponse, IncomingMessage } from 'http';
import type { ActionResult } from './types.js';
import { HttpContext } from './http-context.js';
import { Middleware } from './middleware.js';
export type RouteHandler<TDeps, TBody = unknown> = (ctx: HttpContext<TDeps, TBody>) => Promise<ActionResult>;
export type RouteConfig<TDeps> = {
    [key: string]: RouteHandler<TDeps, any>;
};
export declare abstract class Controller<TDeps = unknown> {
    protected readonly deps: TDeps;
    constructor(deps: TDeps);
    abstract readonly routes: RouteConfig<TDeps>;
    private middlewares;
    use(mw: Middleware<TDeps>): void;
    execute(req: IncomingMessage, res: ServerResponse, actionName: string, globalMiddlewares?: Middleware<TDeps>[]): Promise<void>;
    protected render(res: ServerResponse, r: ActionResult): void;
}
