import type { HttpResponse, HttpResponseWithHeaders } from '@kurdel/common';

import type { ActionResult } from '@kurdel/core/http';

/** Node-bound renderer for ActionResult. */
export function renderActionResult(res: HttpResponse, r: ActionResult): void {
  switch (r.kind) {
    case 'json':
      res.status(r.status).json(r.body);
      break;
    case 'text':
      res.status(r.status).send(r.body);
      break;
    case 'html': {
      const withHeaders = res as HttpResponseWithHeaders;
      withHeaders.setHeader?.('Content-Type', r.contentType ?? 'text/html; charset=utf-8');
      res.status(r.status).send(r.body);
      break;
    }
    case 'redirect':
      res.redirect(r.status, r.location);
      break;
    case 'empty':
      res.status(r.status).send('');
      break;
  }
}
