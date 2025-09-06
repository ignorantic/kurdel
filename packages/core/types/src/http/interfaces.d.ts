export declare const IServerAdapter: unique symbol;
export interface IServerAdapter {
    listen(port: number, callback: Function): void;
}
