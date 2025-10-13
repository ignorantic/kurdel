// Node-bound helper for converting IncomingMessage into URL.

import type { IncomingMessage } from 'node:http';

import { buildURL, DEFAULT_INTERNAL_BASE } from '@kurdel/common';

/**
 * Converts Node's IncomingMessage to a URL using a fixed internal base.
 * We intentionally ignore the Host header for security/stability.
 */
export function buildURLFromReq(req: IncomingMessage, base: string = DEFAULT_INTERNAL_BASE): URL {
  return buildURL(req.url ?? '/', base);
}
