import { ActionResult, JsonValue } from './types.js';
import { HttpError } from './http-error.js';
export declare const Ok: (body?: JsonValue) => ActionResult;
export declare const Created: (body?: JsonValue) => ActionResult;
export declare const NoContent: () => ActionResult;
export declare const BadRequest: (msg: string, details?: unknown) => HttpError;
export declare const NotFound: (msg: string, details?: unknown) => HttpError;
export declare const Conflict: (msg: string, details?: unknown) => HttpError;
export declare const InternalServerError: (msg?: string) => HttpError;
//# sourceMappingURL=http-results.d.ts.map