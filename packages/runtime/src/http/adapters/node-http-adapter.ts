import type { IncomingMessage, ServerResponse } from 'node:http';

import { DEFAULT_INTERNAL_BASE, type HttpRequest, type HttpResponse } from '@kurdel/common';

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
export function adaptNodeResponse(res: ServerResponse): HttpResponse {
  let sent = false;

  const wrap: HttpResponse = {
    status(code: number) {
      res.statusCode = code;
      return wrap;
    },

    json(data: unknown) {
      if (sent) return;
      const body = JSON.stringify(data);
      res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(body);
      sent = true;
    },

    send(data: string | Uint8Array) {
      if (sent) return;
      res.writeHead(res.statusCode || 200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
      sent = true;
    },

    redirect(status: number, location: string) {
      if (sent) return;
      res.writeHead(status, { Location: location });
      res.end();
      sent = true;
    },

    get sent() {
      return sent;
    },
  };

  return wrap;
}
