import type { HttpResponse } from './interfaces.js';

/**
 * Extended interface for platform adapters (Node, Express, etc.)
 * that expose header manipulation methods.
 */
export interface HttpResponseWithHeaders extends HttpResponse {
  /** Set a response header (platform-specific) */
  setHeader(name: string, value: string): void;

  /** Retrieve a response header */
  getHeader(name: string): string | undefined;

  /** Optional shorthand for MIME type */
  type?(mime: string): this;
}
