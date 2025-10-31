import type { ServerResponse } from 'node:http';
import type { HttpResponse, HttpResponseWithHeaders } from '@kurdel/common';
import type { ActionResult, StreamResult } from '@kurdel/core/http';

/**
 * Node-specific renderer for ActionResult.
 * Handles JSON, text, HTML, redirects, empties and stream bodies.
 */
export function renderNodeActionResult(res: HttpResponse, r: ActionResult): void {
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

    case 'stream': {
      const s = r as StreamResult<NodeJS.ReadableStream>;
      const withHeaders = res as HttpResponseWithHeaders;
      const nodeRes = res.raw as unknown as ServerResponse;

      if (s.contentType) withHeaders.setHeader?.('Content-Type', s.contentType);
      if (s.contentLength) withHeaders.setHeader?.('Content-Length', String(s.contentLength));

      res.status(s.status);

      const stream = s.body;

      if (stream && typeof stream.pipe === 'function' && typeof nodeRes.write === 'function') {
        // ✅ Pipe directly into native Node response
        stream.pipe(nodeRes);
      } else {
        res.status(500).send('Invalid stream body');
      }
      break;
    }

    default:
      res.status(500).send('Unsupported response type');
  }
}
