import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { JsonValue, Query, ActionResult } from 'src/http/index.js';

/**
 * ## HttpContext
 *
 * Immutable per-request execution context for Kurdel runtime.
 *
 * Each incoming request produces a unique `HttpContext` instance,
 * which travels through middleware and controller pipelines.
 *
 * It encapsulates parsed HTTP data, route metadata, and helper
 * methods for constructing `ActionResult` responses.
 */
export interface HttpContext<
  /** Parsed request body type */
  TBody = unknown,
  /** URL parameters extracted from route */
  TParams extends Record<string, string> = Record<string, string>,
  /** Streamable response type (e.g. for SSR or files) */
  TReadable = unknown,
> {
  /**
   * Underlying HTTP request abstraction provided by the active adapter.
   */
  readonly req: HttpRequest;

  /**
   * Underlying HTTP response abstraction provided by the active adapter.
   * Used by the renderer to send the actual response.
   */
  readonly res: HttpResponse;

  /**
   * Fully parsed request URL including pathname and query string.
   */
  readonly url: URL;

  /**
   * Parsed query parameters of the current request.
   */
  readonly query: Query;

  /**
   * Path parameters extracted from the matched route.
   */
  readonly params: TParams;

  /**
   * Parsed request body (if available and supported by middleware).
   */
  body?: TBody;

  /**
   * The last computed {@link ActionResult} for this request.
   *
   * Populated by the orchestrator or renderer after a middleware
   * or controller produces a result.
   *
   * Logging / metrics middleware may rely on this value even if
   * the pipeline was short-circuited (e.g., by authentication).
   */
  result?: ActionResult<TReadable>;

  // ─────────────────────────────────────────────
  // Response construction helpers
  // ─────────────────────────────────────────────

  /**
   * Constructs a JSON response with the given HTTP status code.
   *
   * @param status - HTTP status code
   * @param body - JSON-serializable object
   */
  json(status: number, body: JsonValue): ActionResult<TReadable>;

  /**
   * Constructs a plain-text response with the given status and message.
   *
   * @param status - HTTP status code
   * @param body - Text content
   */
  text(status: number, body: string): ActionResult<TReadable>;

  /**
   * Constructs a redirect response to the given location.
   *
   * @param status - HTTP redirect status (3xx)
   * @param location - Target URL or path
   */
  redirect(status: number, location: string): ActionResult<TReadable>;

  /**
   * Constructs a 204 "No Content" response.
   */
  noContent(): ActionResult<TReadable>;
}
