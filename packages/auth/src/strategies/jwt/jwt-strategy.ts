import type { AuthUser } from '@kurdel/common';
import type { HttpRequest } from '@kurdel/common';

import type { AuthStrategy } from 'src/domain/index.js';
import type { AuthUserRepository } from 'src/repositories/index.js';
import type { JwtService } from 'src/strategies/index.js';

/**
 * ## JwtStrategyOptions
 *
 * Configures how the strategy extracts and validates JWT tokens.
 */
export interface JwtStrategyOptions {
  header?: string;     // default: 'authorization'
  prefix?: string;     // default: 'Bearer'
}

/**
 * ## JwtStrategy
 *
 * Authentication strategy that validates a JWT token from
 * the HttpRequest and returns an AuthUser.
 */
export class JwtStrategy implements AuthStrategy {
  private readonly header: string;
  private readonly prefix: string;

  constructor(
    private readonly service: JwtService,
    private readonly users: AuthUserRepository,
    opts: JwtStrategyOptions = {},
  ) {
    this.header = (opts.header ?? 'authorization').toLowerCase();
    this.prefix = (opts.prefix ?? 'Bearer').toLowerCase();
  }

  async authenticate(req: HttpRequest): Promise<AuthUser | null> {
    const raw = req.headers?.[this.header];
    if (!raw) return null;

    const str = Array.isArray(raw) ? raw[0] : raw;
    const value = typeof str === 'string' ? str.trim() : '';

    if (!value.toLowerCase().startsWith(this.prefix.toLowerCase())) {
      return null;
    }

    const token = value.slice(this.prefix.length).trim();

    try {
      const payload = this.service.verify(token);

      if (!payload.sub) return null;

      return await this.users.findById(payload.sub);
    } catch {
      return null;
    }
  }
}
