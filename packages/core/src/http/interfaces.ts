export const IHttpServerAdapter = Symbol('IHttpServerAdapter');
export interface IHttpServerAdapter {
  listen(port: number, callback: Function): void;
}

