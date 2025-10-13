import type { ServerResponse } from 'node:http';

import type { ActionResult } from '@kurdel/core/http';

/** Node-bound renderer for ActionResult. */
export function renderActionResult(res: ServerResponse, r: ActionResult): void {
  switch (r.kind) {
    case 'json': {
      const body = JSON.stringify(r.body);
      res.writeHead(r.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body).toString(),
      });
      res.end(body);
      return;
    }
    case 'text': {
      res.writeHead(r.status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(r.body);
      return;
    }
    case 'redirect': {
      res.writeHead(r.status, { Location: r.location });
      res.end();
      return;
    }
    case 'empty': {
      res.statusCode = r.status;
      res.end();
      return;
    }
  }
}
