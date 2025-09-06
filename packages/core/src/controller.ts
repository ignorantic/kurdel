import { ServerResponse, IncomingMessage } from 'http';
import { buildURL, toQuery } from './utils/url.js';
import type { ActionResult, HttpContext, RouteConfig } from './types.js';

export abstract class Controller<TDeps = unknown> {
  constructor(protected readonly deps: TDeps) {}

  // strict whitelist
  abstract readonly routes: RouteConfig<TDeps>;

  async execute(req: IncomingMessage, res: ServerResponse, actionName: string): Promise<void> {
    const handler = this.routes[actionName];
    if (typeof handler !== 'function') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
      return;
    }

    const url = buildURL(req);
    const ctx: HttpContext<TDeps> = {
      req,
      res,
      url,
      query: toQuery(url),
      deps: this.deps,
    };

    try {
      const result = await handler.call(this, ctx);
      if (!res.headersSent) this.render(res, result);
    } catch (e) {
      if (!res.headersSent) {
        this.render(res, { kind: 'json', status: 500, body: { error: 'Internal Server Error' } });
      }
      // optional logging via deps
      try { (this.deps as any)?.logger?.error?.(e); } catch {}
    }
  }

  protected render(res: ServerResponse, r: ActionResult): void {
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
