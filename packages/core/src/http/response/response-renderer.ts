import type { HttpResponse } from '@kurdel/common';

import type { ActionResult } from 'src/http/index.js';

export interface ResponseRenderer {
  render(res: HttpResponse, result: ActionResult | void): void;
  handleError(res: HttpResponse, err: unknown): void
}
