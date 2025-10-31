import { createReadStream, promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import mime from 'mime-types';
import type { Middleware, HttpContext } from '@kurdel/core/http';
import type { ActionResult } from '@kurdel/core/http';

/**
 * Static file middleware for Node.js runtime.
 * 
 * - Serves files from a configured directory
 * - Falls back to next() if file not found
 * - Returns a StreamResult for readable files
 */
export function serveStaticMiddleware(rootDir: string): Middleware {
  return async (ctx: HttpContext, next): Promise<void | ActionResult<NodeJS.ReadableStream>> => {
    const urlPath = ctx.url.pathname ?? '/';
    const filePath = join(rootDir, decodeURIComponent(urlPath));
    const extension = extname(filePath);
    const mimeType = extension ? mime.lookup(extension) || 'application/octet-stream' : undefined;

    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        // Skip directories → let next() handle
        return (await next()) as ActionResult<NodeJS.ReadableStream> | void;
      }

      const stream = createReadStream(filePath);

      return {
        kind: 'stream',
        status: 200,
        body: stream,
        contentType: mimeType,
        contentLength: stat.size,
      } as const;
    } catch {
      // Not found → delegate downstream
      return (await next()) as ActionResult<NodeJS.ReadableStream> | void;
    }
  };
}
