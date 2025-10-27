import type { IncomingMessage, ServerResponse } from 'node:http';

import type { HttpRequest, HttpResponseWithHeaders } from '@kurdel/common';
import { DEFAULT_INTERNAL_BASE } from '@kurdel/common';

/**
 * Reads request body and parses JSON if possible.
 */
export async function adaptNodeRequest(req: IncomingMessage): Promise<HttpRequest> {
  const chunks: Buffer[] = [];

  if (Symbol.asyncIterator in req) {
    for await (const chunk of req as any) {
      chunks.push(chunk);
    }
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();

  // Normalize headers
  const rawHeaders = req.headers ?? {};

  const headers: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value !== undefined) headers[key] = value;
  }

  // Parse JSON only if declared as JSON
  const contentType = (req.headers?.['content-type'] ?? '').toString();
  let parsed: unknown;
  if (contentType.includes('application/json')) {
    try {
      parsed = raw ? JSON.parse(raw) : undefined;
    } catch {
      parsed = undefined;
    }
  }

  // Build URL and query
  const url = new URL(req.url ?? '/', DEFAULT_INTERNAL_BASE);
  const query: Record<string, string | string[]> = {};
  url.searchParams.forEach((v, k) => {
    if (k in query) {
      const prev = query[k];
      query[k] = Array.isArray(prev) ? [...prev, v] : [prev as string, v];
    } else {
      query[k] = v;
    }
  });

  return {
    method: req.method ?? 'GET',
    url: req.url ?? '/',
    headers,
    body: parsed,
    query,
    params: {},
  };
}

/**
 * Wraps native ServerResponse into a platform-independent HttpResponse.
 */
export function adaptNodeResponse(res: ServerResponse): HttpResponseWithHeaders {
  return {
    get sent() {
      return res.writableEnded || res.destroyed;
    },

    status(code: number) {
      res.statusCode = code;
      return this;
    },
    send(body: any) {
      if (body == null) {
        res.end();
        return this;
      }

      const content = typeof body === 'object' ? JSON.stringify(body) : String(body);

      if (!res.getHeader('content-type')) {
        res.setHeader(
          'content-type',
          typeof body === 'object' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8'
        );
      }

      res.end(content);
      return this;
    },
    json: (body: unknown) => {
      res.statusCode = res.statusCode || 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
      return res;
    },
    redirect(code: number, location: string) {
      res.statusCode = code;
      res.setHeader('location', location);
      res.end();
      return this;
    },
    setHeader(name: string, value: string) { res.setHeader(name, value); },
    getHeader(name: string) {
      const v = res.getHeader(name);
      return typeof v === 'string' ? v : Array.isArray(v) ? v.join(', ') : undefined;
    },
    type(mime: string) {
      this.setHeader('Content-Type', mime);
      return this;
    },
  };
}
