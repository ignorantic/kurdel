import type { Request, Response } from 'express';
import { DEFAULT_INTERNAL_BASE, type HttpRequest, type HttpResponse } from '@kurdel/common';

/**
 * Converts Express's Request into a framework-agnostic HttpRequest.
 */
export function adaptExpressRequest(req: Request): HttpRequest {
  // Normalize headers
  const headers: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers[key] = value;
  }

  // Construct query object (Express provides it already normalized)
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(req.query)) {
    query[key] = Array.isArray(value) ? (value as string[]) : value != null ? String(value) : '';
  }

  // Parse body only if present
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      /* keep as string */
    }
  }

  // Express doesn't include full URL — reconstruct from base
  const url = new URL(req.originalUrl || req.url, DEFAULT_INTERNAL_BASE);

  return {
    method: req.method,
    url: url.pathname + url.search,
    headers,
    body,
    query,
    params: req.params ?? {},
  };
}

/**
 * Wraps Express's Response into a platform-independent HttpResponse.
 */
export function adaptExpressResponse(res: Response): HttpResponse {
  return {
    status(code: number) {
      res.status(code);
      return this;
    },
    send(body: any) {
      if (body == null) {
        res.end();
        return this;
      }

      if (typeof body === 'object') {
        if (!res.getHeader('content-type')) {
          res.type('application/json');
        }
        res.send(JSON.stringify(body));
      } else {
        res.send(String(body));
      }

      return this;
    },
    json(data: unknown) {
      res.json(data);
      return this;
    },
    redirect(code: number, location: string) {
      res.redirect(code, location);
      return this;
    },
  } as unknown as HttpResponse;
}
