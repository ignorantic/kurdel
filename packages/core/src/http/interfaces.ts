export interface HttpServerAdapter {
  listen(port: number, callback: Function): void;
}

