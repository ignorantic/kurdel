import type { HttpRequest, HttpResponse } from '@kurdel/common';

import type { JsonValue, Query, ActionResult } from 'src/http/index.js';

export interface HttpContext<TBody = unknown, TParams = Record<string, string>, TReadable = unknown> {
  req: HttpRequest;
  res: HttpResponse;
  url: URL;
  query: Query;
  params: TParams;
  body?: TBody;
  json(status: number, body: JsonValue): ActionResult<TReadable>;
  text(status: number, body: string): ActionResult<TReadable>;
  redirect(status: number, location: string): ActionResult<TReadable>;
  noContent(): ActionResult<TReadable>;
}
