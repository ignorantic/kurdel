export type Method = 'GET' | 'POST';

export type Route = { method: Method, path: string, handler: Function };

export type Query = Readonly<Record<string, string | string[] | undefined>>;

export type RouteConfig<T> = {
  method: Method,
  path: string,
  action: keyof T,
}[]

