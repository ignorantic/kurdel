import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { HttpContext, RouteMatch, JsonValue, ActionResult } from '@kurdel/core/http';

/**
 * ## RuntimeHttpContextFactory
 *
 * Factory responsible for constructing per-request {@link HttpContext} instances.
 *
 * Each incoming request gets a fresh context object encapsulating:
 * - low-level request/response abstractions;
 * - resolved route metadata (params, query, body, schema);
 * - typed helpers for producing {@link ActionResult}s.
 *
 * The factory isolates context creation logic from orchestration and controller execution.
 *
 * @remarks
 * The produced context is immutable except for the optional `result` field,
 * which is populated later by the runtime orchestrator or renderer.
 */
export class RuntimeHttpContextFactory {
  /**
   * Creates a fully initialized {@link HttpContext} for a given request and route match.
   *
   * @param req - Incoming HTTP request abstraction.
   * @param res - Outgoing HTTP response abstraction.
   * @param match - Resolved route metadata containing params, schema, and controller info.
   *
   * @returns A new {@link HttpContext} instance representing the current request.
   */
  create(req: HttpRequest, res: HttpResponse, match: RouteMatch): HttpContext {
    const url = new URL(req.url ?? '/', 'http://internal');

    return {
      /** Underlying request object */
      req,

      /** Underlying response object */
      res,

      /** Fully parsed URL of the current request */
      url,

      /** Parsed query parameters */
      query: req.query ?? Object.fromEntries(url.searchParams.entries()),

      /** Path parameters extracted from the matched route */
      params: match.params,

      /** Parsed request body (if available) */
      body: req.body,

      /** Matched route metadata (including schema and controller) */
      route: match,

      /** The latest computed ActionResult (populated later at runtime) */
      result: undefined,

      // ────────────────────────────────
      // Response helper constructors
      // ────────────────────────────────

      /**
       * Creates a JSON ActionResult with a given status and body.
       */
      json(status: number, body: JsonValue): ActionResult {
        return { kind: 'json', status, body };
      },

      /**
       * Creates a plain text ActionResult.
       */
      text(status: number, body: string): ActionResult {
        return { kind: 'text', status, body };
      },

      /**
       * Creates a redirect ActionResult to the given location.
       */
      redirect(status: number, location: string): ActionResult {
        return { kind: 'redirect', status, location };
      },

      /**
       * Creates a standard HTTP 204 “No Content” ActionResult.
       */
      noContent(): ActionResult {
        return { kind: 'empty', status: 204 };
      },
    };
  }
}