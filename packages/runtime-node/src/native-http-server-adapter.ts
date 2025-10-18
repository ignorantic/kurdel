import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';

import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { Router, ServerAdapter } from '@kurdel/core/http';

import { adaptNodeRequest, adaptNodeResponse } from './node-http-adapter.js';
import { RuntimeControllerExecutor } from '@kurdel/runtime/http';

/**
 * Node.js implementation of ServerAdapter.
 *
 * Responsibilities:
 * - Create and manage a native HTTP server
 * - Adapt Node's IncomingMessage / ServerResponse into platform-agnostic
 *   HttpRequest / HttpResponse
 * - Delegate execution to the router through a unified runtime executor
 */
export class NativeHttpServerAdapter implements ServerAdapter<HttpRequest, HttpResponse> {
  private readonly server: Server;
  private readonly executor: RuntimeControllerExecutor;
  private handler?: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;

  constructor(router: Router) {
    // Executor handles controller pipelines (middlewares + action)
    this.executor = new RuntimeControllerExecutor(router.middlewares);

    // Node HTTP server delegates every request to our dispatch layer
    this.server = createServer((req, res) => this.dispatch(req, res));
  }

  /**
   * Internal dispatcher: adapts Node's request/response to framework abstractions.
   */
  private async dispatch(req: IncomingMessage, res: ServerResponse) {
    const h = this.handler;
    if (!h) {
      res.statusCode = 404;
      res.end();
      return;
    }

    try {
      // Adapt native Node objects into platform-agnostic types
      const request = await adaptNodeRequest(req);
      const response = adaptNodeResponse(res);

      // Delegate to framework-level handler
      await Promise.resolve(h(request, response));
    } catch (err) {
      console.error('Unhandled request error:', err);
      if (!res.headersSent) {
        try {
          res.statusCode = 500;
          res.end('Internal Server Error');
        } catch {
          console.error('[NativeHttpServerAdapter] Unhandled request error:', err);

          if (!res.headersSent) {
            try {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end('Internal Server Error');
            } catch (nestedErr) {
              console.error('[NativeHttpServerAdapter] Failed to send 500:', nestedErr);
            }
          }
        }
      }
    }
  }

  /**
   * Register the platform-independent handler invoked on every request.
   */
  on(cb: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.handler = cb;
  }

  /**
   * Start listening for incoming connections.
   */
  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void {
    const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
    if (typeof hostOrCb === 'string') {
      this.server.listen(port, hostOrCb, done);
    } else {
      this.server.listen(port, done);
    }
  }

  /**
   * Gracefully close the underlying Node server.
   */
  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }

  /**
   * Returns the raw Node HTTP server instance (used by ApplicationImpl/RunningServer).
   */
  raw<T = Server>(): T | undefined {
    return this.server as unknown as T;
  }
}
