import { createServer, type Server } from 'node:http';

import type { RequestLike, ResponseLike, ServerAdapter } from '@kurdel/core/http';

export class NativeHttpServerAdapter implements ServerAdapter<RequestLike, ResponseLike> {
  private readonly server: Server;
  private handler?: (req: RequestLike, res: ResponseLike) => void | Promise<void>;

  constructor() {
    // The server delegates to the registered handler; if none, 404.
    this.server = createServer((req, res) => {
      const h = this.handler;
      if (!h) {
        (res as any).statusCode = 404;
        (res as any).end?.();
        return;
      }
      Promise.resolve(h(req as any, res as any)).catch(() => {
        // Best-effort fallback in case upstream didn't handle the error.
        if (!(res as any).headersSent) {
          try {
            (res as any).statusCode = 500;
            (res as any).end?.();
          // eslint-disable-next-line no-empty
          } catch {}
        }
      });
    });
  }

  on(cb: (req: RequestLike, res: ResponseLike) => void | Promise<void>) {
    this.handler = cb;
  }

  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void {
    const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
    if (typeof hostOrCb === 'string') {
      this.server.listen(port, hostOrCb, done);
    } else {
      this.server.listen(port, done);
    }
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }

  /** Unified raw getter used by ApplicationImpl/RunningServer. */
  raw<T = Server>(): T | undefined {
    return this.server as unknown as T;
  }
}
