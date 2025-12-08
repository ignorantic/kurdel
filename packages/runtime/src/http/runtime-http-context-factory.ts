import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type {
  HttpContext,
  RouteMatch,
  JsonValue,
  ActionResult,
} from '@kurdel/core/http';

/**
 * ## RuntimeHttpContextFactory
 *
 * Responsible for constructing per-request {@link HttpContext} objects.
 *
 * Each incoming request receives a fresh, isolated context encapsulating:
 * - HTTP request/response wrappers provided by the adapter
 * - parsed URL, query, params, body
 * - matched route metadata (controller/action/schema/auth)
 * - a request-scoped IoC container
 * - typed constructors for {@link ActionResult}
 *
 * The context object is immutable except for `result`,
 * which is later populated by the orchestrator and renderer.
 */
export class RuntimeHttpContextFactory {
  /**
   * Constructs a fully initialized {@link HttpContext} instance.
   *
   * @param req    - incoming HTTP request
   * @param res    - outgoing HTTP response
   * @param match  - router resolution result
   * @param scope  - request-scoped IoC container
   */
  create(
    req: HttpRequest,
    res: HttpResponse,
    match: RouteMatch,
    scope: Container
  ): HttpContext {
    const url = new URL(req.url ?? '/', 'http://internal');

    const query =
      req.query ??
      Object.fromEntries(url.searchParams.entries());

    return {
      /**
       * Request-scoped IoC container.
       *
       * Used by:
       * - authentication strategies
       * - per-request services (logger, db, tracing)
       * - custom middlewares
       * - controllers needing scoped dependencies
       */
      scope,

      /** Underlying request object */
      req,

      /** Underlying response object */
      res,

      /** Fully parsed URL of the current request */
      url,

      /** Parsed query parameters */
      query,

      /** Path parameters extracted from the matched route */
      params: match.params,

      /** Parsed request body (if available) */
      body: req.body,

      /** Matched route metadata (including schema and controller) */
      route: match,

      /**
       * Authenticated user (if authentication middleware succeeded).
       * Populated later in the pipeline.
       */
      user: undefined,

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
