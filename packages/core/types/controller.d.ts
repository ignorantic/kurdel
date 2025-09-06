import { ServerResponse, IncomingMessage } from 'http';
import type { ActionResult, RouteConfig } from './types.js';
export declare abstract class Controller<TDeps = unknown> {
    protected readonly deps: TDeps;
    constructor(deps: TDeps);
    abstract readonly routes: RouteConfig<TDeps>;
    execute(req: IncomingMessage, res: ServerResponse, actionName: string): Promise<void>;
    protected render(res: ServerResponse, r: ActionResult): void;
}
//# sourceMappingURL=controller.d.ts.map