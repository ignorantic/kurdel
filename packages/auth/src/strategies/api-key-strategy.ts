import type { AuthUser, HttpRequest } from '@kurdel/common';

import type { AuthStrategy } from 'src/auth-strategy.js';

export interface ApiKeyStrategyOptions {
  header: string;      // e.g. "x-api-key"
  keys: Record<string, AuthUser>; // key → user
}

/**
 * ## ApiKeyStrategy
 *
 * Looks up the request header and resolves user by API key.
 */
export class ApiKeyStrategy implements AuthStrategy {
  constructor(private readonly opts: ApiKeyStrategyOptions) {}

  async authenticate(req: HttpRequest): Promise<AuthUser | null> {
    const value = req.headers?.[this.opts.header];
    if (!value) return null;

    // Express-style arrays OR strings
    const key = Array.isArray(value) ? value[0] : value;

    return this.opts.keys[key] ?? null;
  }
}
