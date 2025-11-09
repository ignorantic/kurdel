import type { Response } from 'express';
import type { ActionResult, StreamResult } from '@kurdel/core/http';

/**
 * Express-specific renderer for ActionResult.
 * Compatible with Express.Response and middleware chain.
 */
export function renderExpressActionResult(res: Response, r: ActionResult): void {
  switch (r.kind) {
    case 'json':
      res.status(r.status).json(r.body);
      break;

    case 'text':
      res.status(r.status).type('text/plain').send(r.body);
      break;

    case 'html':
      res
        .status(r.status)
        .type(r.contentType ?? 'text/html; charset=utf-8')
        .send(r.body);
      break;

    case 'redirect':
      res.redirect(r.status, r.location);
      break;

    case 'empty':
      res.status(r.status).end();
      break;

    case 'stream': {
      const s = r as StreamResult<NodeJS.ReadableStream>;
      if (s.contentType) res.set('Content-Type', s.contentType);
      if (s.contentLength) res.set('Content-Length', String(s.contentLength));

      res.status(s.status);

      const stream = s.body;
      if (stream && typeof stream.pipe === 'function') {
        stream.pipe(res);
      } else {
        res.status(500).send('Invalid stream body');
      }
      break;
    }

    default:
      res.status(500).send('Unsupported response type');
  }
}
