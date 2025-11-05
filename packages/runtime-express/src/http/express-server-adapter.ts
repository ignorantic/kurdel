import express, { type Request, type Response, type Express } from 'express';
import type { Server } from 'node:http';

import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { ServerAdapter } from '@kurdel/core/http';

import { adaptExpressRequest, adaptExpressResponse } from './express-req-res-adapters.js';

/**
 * Express-based implementation of ServerAdapter.
 *
 * Provides a seamless bridge between Express's native API and
 * the Kurdel runtime HTTP abstraction layer.
 */
export class ExpressServerAdapter implements ServerAdapter<HttpRequest, HttpResponse> {
  private readonly app: Express;
  private server?: Server;
  private handler?: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Delegate all requests to Kurdel runtime
    this.app.all(/.*/, async (req: Request, res: Response) => {
      if (!this.handler) {
        res.status(404).send('No handler registered.');
        return;
      }

      try {
        const request = adaptExpressRequest(req);
        const response = adaptExpressResponse(res);
        await Promise.resolve(this.handler(request, response));
      } catch (err) {
        console.error('[ExpressServerAdapter] Unhandled request error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });
  }

  on(cb: (req: HttpRequest, res: HttpResponse) => void | Promise<void>): void {
    this.handler = cb;
  }

  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void {
    const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
    if (typeof hostOrCb === 'string') {
      this.server = this.app.listen(port, hostOrCb, done);
    } else {
      this.server = this.app.listen(port, done);
    }
  }

  async close(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve, reject) =>
        this.server!.close(err => (err ? reject(err) : resolve()))
      );
    }
  }

  raw<T = Express>(): T | undefined {
    return this.app as unknown as T;
  }

  url(): string {
    const addr = this.server?.address();
    if (!addr) return 'http://localhost';
    if (typeof addr === 'string') return addr;
    return `http://localhost:${addr.port}`;
  }
}
