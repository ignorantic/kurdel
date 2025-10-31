import type { HttpResponse } from '@kurdel/common';
import type { ActionResult, ResponseRenderer } from '@kurdel/core/http';

/** No-op renderer used for non-platform runtime tests. */
export class NoopResponseRenderer implements ResponseRenderer {
  render(_res: HttpResponse, _result: ActionResult | void): void {
    // do nothing
  }

  handleError(_res: HttpResponse, _err: unknown): void {
    // do nothing
  }
}