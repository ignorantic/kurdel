import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { HttpContext, RouteMatch } from '@kurdel/core/http';

/**
 * Builds request-scoped HttpContext objects.
 * Keeps creation logic isolated from controller execution.
 */
export class RuntimeHttpContextFactory {
  create(req: HttpRequest, res: HttpResponse, match: RouteMatch): HttpContext {
    return {
      req,
      res,
      url: new URL(req.url, 'http://internal'),
      query: req.query,
      params: match.params,
      body: req.body,

      json: (status, body) => ({ kind: 'json', status, body }),
      text: (status, body) => ({ kind: 'text', status, body }),
      redirect: (status, location) => ({ kind: 'redirect', status, location }),
      noContent: () => ({ kind: 'empty', status: 204 }),
    };
  }
}
