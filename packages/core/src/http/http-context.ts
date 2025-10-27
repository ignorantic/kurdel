import type { HttpRequest, HttpResponse } from '@kurdel/common';

import type { JsonValue, Query } from 'src/http/types.js';
import type { ActionResult } from 'src/http/action-result.js';

export interface HttpContext<TBody = unknown, TParams = Record<string, string>> {
  req: HttpRequest;
  res: HttpResponse;
  url: URL;
  query: Query;
  params: TParams;
  body?: TBody;
  json(status: number, body: JsonValue): ActionResult;
  text(status: number, body: string): ActionResult;
  redirect(status: number, location: string): ActionResult;
  noContent(): ActionResult;
}
