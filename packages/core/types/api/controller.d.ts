import { ServerResponse, IncomingMessage } from 'http';
import type { ActionResult, Middleware, RouteConfig } from './types.js';
export declare abstract class Controller<TDeps = unknown> {
    protected readonly deps: TDeps;
    constructor(deps: TDeps);
    abstract readonly routes: RouteConfig<TDeps>;
    private middlewares;
    use(mw: Middleware<TDeps>): void;
    execute(req: IncomingMessage, res: ServerResponse, actionName: string, globalMiddlewares?: Middleware<TDeps>[]): Promise<void>;
    protected render(res: ServerResponse, r: ActionResult): void;
}
//# sourceMappingURL=controller.d.ts.map