import type { Query } from '../types.js';
import { IncomingMessage } from 'http';

const INTERNAL_BASE = 'http://internal';

export function buildURL(req: IncomingMessage): URL {
  // do not trust host header; use fixed base
  return new URL(req.url ?? '/', INTERNAL_BASE);
}

export function toQuery(u: URL): Query {
  const out: Record<string, string | string[]> = {};
  u.searchParams.forEach((value, key) => {
    if (key in out) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, value] : [prev as string, value];
    } else {
      out[key] = value;
    }
  });
  return out;
}
