import http, { Server } from 'http';
import { Method } from '../types.js';
import { Router } from '../router.js';
import { HttpServerAdapter } from './interfaces.js';

export class NativeHttpServerAdapter implements HttpServerAdapter {
  private server: Server;

  constructor(router: Router) {
    this.server = http.createServer((req, res) => {
      const { method, url } = req;
      const handler = router.resolve(method as Method, url as string);
      if (handler) {
        handler(req, res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });
  }

  public listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
  }
}
