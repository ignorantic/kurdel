export const IServerAdapter = Symbol('IServerAdapter');
export interface IServerAdapter {
  listen(port: number, callback: Function): void;
}

