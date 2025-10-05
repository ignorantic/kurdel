import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { ServerAdapter } from 'src/api/http/interfaces.js';

export class NativeHttpServerAdapter implements ServerAdapter<IncomingMessage, ServerResponse> {
  private server = http.createServer();

  on(h: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>): void {
    this.server.removeAllListeners('request');
    this.server.on('request', (req, res) => { void Promise.resolve(h(req, res)); });
  }

  listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
  }

  getHttpServer(): Server {
    return this.server;
  }
}
