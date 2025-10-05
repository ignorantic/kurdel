import { IncomingMessage, ServerResponse } from 'http';
import { Newable } from '@kurdel/common';
import { Model } from '../../api/db/model.js';
import { ModelConfig } from './interfaces.js';
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type Route = {
    method: Method;
    path: string;
    handler: Function;
};
export type Query = Readonly<Record<string, string | string[]>>;
export type HttpRequest = unknown;
export type HttpResponse = unknown;
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [k: string]: JsonValue;
};
export type ActionResult = {
    kind: 'json';
    status: number;
    body: JsonValue;
} | {
    kind: 'text';
    status: number;
    body: string;
} | {
    kind: 'empty';
    status: number;
} | {
    kind: 'redirect';
    status: number;
    location: string;
};
export type HttpContext<TDeps = unknown, TBody = unknown> = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    query: Query;
    params: Record<string, string>;
    deps: TDeps;
    body?: TBody;
};
export type RouteHandler<TDeps, TBody = unknown> = (ctx: HttpContext<TDeps, TBody>) => Promise<ActionResult>;
export type RouteConfig<TDeps> = {
    [key: string]: RouteHandler<TDeps, any>;
};
export type Middleware<TDeps = unknown, TBody = unknown> = (ctx: HttpContext<TDeps, TBody>, next: () => Promise<ActionResult>) => Promise<ActionResult>;
export type ModelList = (Newable<Model> | ModelConfig)[];
