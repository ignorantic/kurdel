import type { JsonValue } from 'src/http/index.js';

/**
 * Base shape for all HTTP responses returned by controller actions.
 *
 * All ActionResult variants share a status code and may include optional headers or cookies.
 */
export interface BaseResult {
  /** HTTP status code (e.g., 200, 404, 500) */
  status: number;
  /** Optional response headers */
  headers?: Record<string, string>;
  /** Optional cookies to set in response */
  cookies?: Record<string, string>;
  /** Optional error payload (for diagnostics/logging) */
  error?: unknown;
}

/**
 * Streaming response — e.g. file download, SSE, proxied stream.
 */
export interface StreamResult<TReadable = unknown> extends BaseResult {
  kind: 'stream';
  /** Platform-neutral stream descriptor */
  body: TReadable;
  /** Optional MIME type */
  contentType?: string;
  /** Optional content length (bytes) */
  contentLength?: number;
}

/**
 * JSON response result.
 */
export interface JsonResult extends BaseResult {
  kind: 'json';
  body: JsonValue;
  contentType?: string;
}

/**
 * Plain text or pre-rendered HTML response.
 */
export interface TextResult extends BaseResult {
  kind: 'text';
  body: string;
  contentType?: string;
}

/**
 * Result representing a rendered HTML template.
 */
export interface HtmlResult extends BaseResult {
  kind: 'html';
  body: string;
  contentType?: string;
}

/**
 * Redirect response (302, 301, 307, etc.)
 */
export interface RedirectResult extends BaseResult {
  kind: 'redirect';
  location: string;
}

/**
 * Empty response (204 No Content, etc.)
 */
export interface EmptyResult extends BaseResult {
  kind: 'empty';
}

/**
 * Union of all possible controller return types.
 */
export type ActionResult<TReadable = unknown> =
  | JsonResult
  | TextResult
  | HtmlResult
  | RedirectResult
  | EmptyResult
  | StreamResult<TReadable>;
