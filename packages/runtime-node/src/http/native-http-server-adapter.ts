import type { Server, IncomingMessage, ServerResponse } from 'node:http';
import { createServer } from 'node:http';

import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { ServerAdapter } from '@kurdel/core/http';

import { adaptNodeRequest, adaptNodeResponse } from 'src/http/native-req-res-adapters.js';

/**
 * Node.js implementation of ServerAdapter.
 *
 * Responsibilities:
 * - Listen for native HTTP requests
 * - Adapt Node's IncomingMessage / ServerResponse into
 *   framework-agnostic HttpRequest / HttpResponse
 * - Delegate execution to the runtime handler
 */
export class NativeHttpServerAdapter implements ServerAdapter<HttpRequest, HttpResponse> {
  private readonly server: Server;
  private handler?: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;

  constructor() {
    // Delegate each incoming request to the unified dispatch method
    this.server = createServer((req, res) => this.dispatch(req, res));
  }

  /** Core dispatch: adapt and delegate to the framework handler. */
  private async dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.handler) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    try {
      const request = await adaptNodeRequest(req);
      const response = adaptNodeResponse(res);

      await Promise.resolve(this.handler(request, response));
    } catch (err) {
      this.handleDispatchError(res, err);
    }
  }

  /** Minimal fallback when handler throws unexpectedly. */
  private handleDispatchError(res: ServerResponse, err: unknown): void {
    console.error('Unhandled request error:', err);

    if (res.headersSent) return;

    const status = (err as any)?.status ?? 500;
    const message = (err as any)?.message ?? 'Internal Server Error';

    res.statusCode = status;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`${status}: ${message}`);
  }

  /** Register the runtime handler invoked for every request. */
  on(cb: (req: HttpRequest, res: HttpResponse) => void | Promise<void>): void {
    this.handler = cb;
  }

  /** Start listening for HTTP connections. */
  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void {
    const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
    if (typeof hostOrCb === 'string') this.server.listen(port, hostOrCb, done);
    else this.server.listen(port, done);
  }

  /** Gracefully close the underlying HTTP server. */
  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.server.close(err => (err ? reject(err) : resolve()))
    );
  }

  /** Expose the raw Node.js server (used by the runtime). */
  raw<T = Server>(): T {
    return this.server as unknown as T;
  }
}
