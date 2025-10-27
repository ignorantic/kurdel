export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// eslint-disable-next-line
export type Route = { method: Method; path: string; handler: Function };

export type Query = Readonly<Record<string, string | string[]>>;

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
