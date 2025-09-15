import http, { Server } from 'http';
import { Method } from '../types.js';
import { Router } from '../router.js';
import { IServerAdapter } from './interfaces.js';

type Deps = {
  router: Router;
};

export class NativeHttpServerAdapter implements IServerAdapter {
  private server: Server;

  constructor(private deps: Deps) {
    this.server = http.createServer((req, res) => {
      const { method, url } = req;
      const handler = this.deps.router.resolve(method as Method, url as string);

      if (handler) {
        handler(req, res);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not Found');
      }
    });
  }

  public listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
  }

  public getHttpServer(): Server {
    return this.server;
  }
}
