import { IncomingMessage, ServerResponse } from 'http';
import { Newable } from '@kurdel/common';
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type Route = {
    method: Method;
    path: string;
    handler: Function;
};
export type Query = Readonly<Record<string, string | string[]>>;
export type JsonValue = string | number | boolean | null | {
    [k: string]: JsonValue;
} | JsonValue[];
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
export type HttpContext<TDeps = unknown> = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    query: Query;
    params: Record<string, string>;
    deps: TDeps;
};
export type RouteConfig<TDeps> = {
    [action: string]: (ctx: HttpContext<TDeps>) => Promise<ActionResult> | ActionResult;
};
export interface ControllerResolver {
    get<T>(cls: Newable<T>): T;
}
//# sourceMappingURL=types.d.ts.map