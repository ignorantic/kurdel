import { buildURL, toQuery } from '../utils/url.js';
export class Controller {
    constructor(deps) {
        this.deps = deps;
        this.middlewares = [];
    }
    use(mw) {
        this.middlewares.push(mw);
    }
    async execute(req, res, actionName, globalMiddlewares = []) {
        const handler = this.routes[actionName];
        if (typeof handler !== 'function') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
            return;
        }
        const url = buildURL(req);
        const ctx = {
            req,
            res,
            url,
            query: toQuery(url),
            params: req.__params ?? {},
            deps: this.deps,
            json(status, body) {
                return { kind: 'json', status, body };
            },
            text(status, body) {
                return { kind: 'text', status, body };
            },
            redirect(status, location) {
                return { kind: 'redirect', status, location };
            },
            noContent() {
                return { kind: 'empty', status: 204 };
            },
        };
        const pipeline = [...globalMiddlewares, ...this.middlewares];
        // last step = actual action
        const dispatch = async () => handler.call(this, ctx);
        // build composed middleware chain
        const composed = pipeline.reduceRight((next, mw) => {
            return () => mw(ctx, next);
        }, dispatch);
        try {
            const result = await composed();
            if (!res.headersSent)
                this.render(res, result);
        }
        catch (e) {
            if (!res.headersSent) {
                this.render(res, { kind: 'json', status: 500, body: { error: 'Internal Server Error' } });
            }
            try {
                this.deps?.logger?.error?.(e);
            }
            catch { }
        }
    }
    render(res, r) {
        switch (r.kind) {
            case 'json': {
                const body = JSON.stringify(r.body);
                res.writeHead(r.status, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': Buffer.byteLength(body).toString(),
                });
                res.end(body);
                return;
            }
            case 'text': {
                res.writeHead(r.status, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(r.body);
                return;
            }
            case 'redirect': {
                res.writeHead(r.status, { Location: r.location });
                res.end();
                return;
            }
            case 'empty': {
                res.statusCode = r.status;
                res.end();
                return;
            }
        }
    }
}
//# sourceMappingURL=controller.js.map