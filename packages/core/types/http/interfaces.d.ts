export declare const IHttpServerAdapter: unique symbol;
export interface IHttpServerAdapter {
    listen(port: number, callback: Function): void;
}
