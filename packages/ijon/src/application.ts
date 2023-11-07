import http from 'http';
import { Router, Method } from './router.js';

export class Application {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      
      const handler = this.router.resolve(method as Method, url as string);

      if (handler) {
        handler(req, res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    server.listen(port, callback);
  }
}

