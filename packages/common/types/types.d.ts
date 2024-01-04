export type Method = 'GET' | 'POST';
export type Route = {
    method: Method;
    path: string;
    handler: Function;
};
export type RouteConfig<T> = {
    method: Method;
    path: string;
    action: keyof T;
}[];
export type Newable<T> = new (...args: any[]) => T;
