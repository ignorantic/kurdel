import { createReadStream, promises as fs } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import mime from 'mime-types';
import type { Middleware, HttpContext, ActionResult } from '@kurdel/core/http';

/**
 * @kurdel
 * Node.js static file middleware.
 *
 * Responsibilities:
 * - Serve static files from a configured directory
 * - Prevent directory traversal
 * - Set correct MIME type
 * - Fallback to `next()` if file not found
 */
export function serveStaticMiddleware(rootDir: string): Middleware<unknown, NodeJS.ReadableStream> {
  return async (ctx: HttpContext, next): Promise<void | ActionResult<NodeJS.ReadableStream>> => {
    try {
      // Normalize path to prevent traversal (`..`)
      const urlPath = decodeURIComponent(ctx.url.pathname ?? '/');
      const safePath = normalize(join(rootDir, urlPath)).replace(/\\/g, '/');

      if (!safePath.startsWith(rootDir.replace(/\\/g, '/'))) {
        // Security guard — attempt to escape root directory
        return next();
      }

      let filePath = safePath;

      // If it's a directory, try to serve index.html
      const stat = await fs.stat(filePath).catch(() => null);
      if (stat?.isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const finalStat = await fs.stat(filePath).catch(() => null);
      if (!finalStat?.isFile()) {
        return next();
      }

      const extension = extname(filePath);
      const mimeType = mime.lookup(extension) || 'application/octet-stream';

      const stream = createReadStream(filePath);

      return {
        kind: 'stream',
        status: 200,
        body: stream,
        contentType: mimeType,
        contentLength: finalStat.size,
      };
    } catch {
      return next();
    }
  };
}
