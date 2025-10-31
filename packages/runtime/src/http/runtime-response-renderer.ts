import type { ActionResult, JsonValue } from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';
import type { HttpResponse } from '@kurdel/common';

import { renderActionResult } from 'src/http/render-action-result.js';

/**
 * Handles rendering of ActionResult into HttpResponse
 * and unified error translation.
 */
export class RuntimeResponseRenderer {
  render(res: HttpResponse, result: ActionResult | void): void {
    if (!res.sent && result) {
      renderActionResult(res, result);
    }
  }

  handleError(res: HttpResponse, err: unknown): void {
    if (res.sent) return;

    if (err instanceof HttpError) {
      renderActionResult(res, {
        kind: 'json',
        status: err.status,
        body: {
          error: err.message,
          details: err.details as JsonValue,
        },
      });
    } else {
      renderActionResult(res, {
        kind: 'json',
        status: 500,
        body: { error: 'Internal Server Error' },
      });
    }
  }
}
