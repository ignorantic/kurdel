import type { ActionResult, JsonValue, ResponseRenderer } from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';
import type { HttpResponse } from '@kurdel/common';

/**
 * Handles rendering of ActionResult into HttpResponse
 * and unified error translation.
 */
export class RuntimeResponseRenderer implements ResponseRenderer {
  constructor(
    private readonly platformRender: (res: HttpResponse, result: ActionResult) => void
  ) {}

  render(res: HttpResponse, result: ActionResult | void): void {
    if (!res.sent && result) {
      this.platformRender(res, result);
    }
  }

  handleError(res: HttpResponse, err: unknown): void {
    if (res.sent) return;

    if (err instanceof HttpError) {
      this.platformRender(res, {
        kind: 'json',
        status: err.status,
        body: {
          error: err.message,
          details: err.details as JsonValue,
        },
      });
    } else {
      this.platformRender(res, {
        kind: 'json',
        status: 500,
        body: { error: 'Internal Server Error' },
      });
    }
  }
}
