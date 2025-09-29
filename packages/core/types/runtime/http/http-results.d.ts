import { ActionResult, JsonValue } from './types.js';
export declare const Ok: (body?: JsonValue) => ActionResult;
export declare const Created: (body?: JsonValue) => ActionResult;
export declare const NoContent: () => ActionResult;
export declare const Text: (body: string, status?: number) => ActionResult;
export declare const Json: (data: JsonValue, status?: number) => ActionResult;
export declare const Redirect: (location: string, status?: number) => ActionResult;
export declare const BadRequest: (msg: string, details?: unknown) => any;
export declare const Unauthorized: (msg?: string, details?: JsonValue) => any;
export declare const Forbidden: (msg?: string, details?: JsonValue) => any;
export declare const NotFound: (msg?: string, details?: JsonValue) => any;
export declare const Conflict: (msg?: string, details?: JsonValue) => any;
export declare const InternalServerError: (msg?: string, details?: JsonValue) => any;
export declare const NotImplemented: (msg?: string, details?: JsonValue) => any;
export declare const ServiceUnavailable: (msg?: string, details?: JsonValue) => any;
//# sourceMappingURL=http-results.d.ts.map