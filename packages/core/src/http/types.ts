export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type Route = { method: Method, path: string, handler: Function };

export type Query = Readonly<Record<string, string | string[]>>;

export type HttpRequest = unknown;

export type HttpResponse = unknown;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export type ActionResult =
  | { kind: 'json'; status: number; body: JsonValue }
  | { kind: 'text'; status: number; body: string }
  | { kind: 'empty'; status: number }
  | { kind: 'redirect'; status: number; location: string };

