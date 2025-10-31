import type { HttpResponse } from '@kurdel/common';

import type { ActionResult } from 'src/http/action-result.js';

export interface ResponseRenderer {
  render(res: HttpResponse, result: ActionResult | void): void;
  handleError(res: HttpResponse, err: unknown): void
}
