import type { IncomingMessage, ServerResponse } from 'node:http';

import type { HttpRequest, HttpResponseWithHeaders } from '@kurdel/common';
import { DEFAULT_INTERNAL_BASE } from '@kurdel/common';

/**
 * Adapts a native Node.js `IncomingMessage` into a platform-neutral `HttpRequest`.
 *
 * Responsibilities:
 * - Read the request body (as text)
 * - Parse JSON if `Content-Type` is `application/json`
 * - Normalize headers into a consistent object
 * - Extract query parameters from URL
 *
 * @param req - The native Node.js HTTP request object
 * @returns A platform-agnostic {@link HttpRequest} used by Kurdel runtime
 */
export async function adaptNodeRequest(req: IncomingMessage): Promise<HttpRequest> {
  const chunks: Buffer[] = [];

  // Collect request body (streamed)
  if (Symbol.asyncIterator in req) {
    for await (const chunk of req as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
  }

  const rawBody: string = Buffer.concat(chunks).toString('utf8').trim();

  // Normalize headers
  const nodeHeaders: IncomingMessage['headers'] = req.headers ?? {};
  const headers: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (value !== undefined) headers[key] = value;
  }

  // Parse JSON body if applicable
  const contentType: string = (req.headers?.['content-type'] ?? '').toString();
  let parsedBody: unknown;
  if (contentType.includes('application/json')) {
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
    } catch {
      parsedBody = undefined;
    }
  }

  // Build absolute URL using default internal base (e.g., http://internal.local)
  const url = new URL(req.url ?? '/', DEFAULT_INTERNAL_BASE);

  // Extract query parameters
  const query: Record<string, string | string[]> = {};
  url.searchParams.forEach((value, key) => {
    if (key in query) {
      const prev = query[key];
      query[key] = Array.isArray(prev) ? [...prev, value] : [prev as string, value];
    } else {
      query[key] = value;
    }
  });

  // Return normalized HttpRequest
  return {
    method: req.method ?? 'GET',
    url: req.url ?? '/',
    headers,
    body: parsedBody,
    query,
    params: {},
  };
}

/**
 * Adapts a native Node.js `ServerResponse` into a framework-agnostic `HttpResponse`.
 *
 * Responsibilities:
 * - Provide a unified API (`status()`, `send()`, `json()`, etc.)
 * - Automatically manage headers and content types
 * - Support streaming and manual writes (`write()` / `end()`)
 *
 * @param res - The native Node.js ServerResponse instance
 * @returns Wrapped {@link HttpResponseWithHeaders} compatible with Kurdel runtime
 */
export function adaptNodeResponse(res: ServerResponse): HttpResponseWithHeaders {
  const response: HttpResponseWithHeaders = {
    get sent(): boolean {
      return res.writableEnded || res.destroyed;
    },

    raw: res,

    status(code: number) {
      res.statusCode = code;
      return this;
    },

    send(body?: unknown) {
      if (body == null) {
        res.end();
        return this;
      }

      const content = typeof body === 'object' ? JSON.stringify(body) : String(body);

      if (!res.getHeader('Content-Type')) {
        res.setHeader(
          'Content-Type',
          typeof body === 'object' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8'
        );
      }

      res.end(content);
      return this;
    },

    json(body: unknown) {
      res.statusCode = res.statusCode || 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
      return this;
    },

    redirect(code: number, location: string) {
      res.statusCode = code;
      res.setHeader('Location', location);
      res.end();
      return this;
    },

    setHeader(name: string, value: string) {
      res.setHeader(name, value);
      return this;
    },

    getHeader(name: string): string | undefined {
      const value = res.getHeader(name);
      return typeof value === 'string'
        ? value
        : Array.isArray(value)
          ? value.join(', ')
          : undefined;
    },

    type(mime: string) {
      this.setHeader('Content-Type', mime);
      return this;
    },

    write(chunk: string | Uint8Array) {
      res.write(chunk);
      return this;
    },

    end(chunk?: string | Uint8Array) {
      res.end(chunk);
      return this;
    },
  };

  return response;
}
