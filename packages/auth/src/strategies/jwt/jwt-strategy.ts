import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult, AuthStrategy } from 'src/domain/index.js';
import type { AuthUserRepository, JwtSessionRepository } from 'src/repositories/index.js';
import type { JwtService } from 'src/strategies/index.js';

/**
 * ## JwtStrategyOptions
 *
 * Configures how the strategy extracts and validates JWT tokens.
 */
export interface JwtStrategyOptions {
  header?: string;     // default: 'authorization'
  prefix?: string;     // default: 'Bearer'
  /** When configured, every token must reference an active session through `jti`. */
  sessions?: JwtSessionRepository;
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
  private readonly sessions?: JwtSessionRepository;

  constructor(
    private readonly service: JwtService,
    private readonly users: AuthUserRepository,
    opts: JwtStrategyOptions = {},
  ) {
    this.header = (opts.header ?? 'authorization').toLowerCase();
    this.prefix = (opts.prefix ?? 'Bearer').toLowerCase();
    this.sessions = opts.sessions;
  }

  async authenticate(req: HttpRequest): Promise<AuthenticationResult | null> {
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

      if (this.sessions) {
        if (typeof payload.jti !== 'string') return null;
        const session = await this.sessions.findById(payload.jti);
        if (!session || session.revoked || String(session.userId) !== String(payload.sub)) {
          return null;
        }
        if (session.expiresAt) {
          const expiresAt = session.expiresAt.getTime();
          if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
        }
      }

      const user = await this.users.findById(payload.sub);
      if (!user) return null;

      return {
        user,
        credential: {
          type: 'jwt',
          ...(typeof payload.jti === 'string' ? { id: payload.jti } : {}),
        },
        claims: payload,
      };
    } catch {
      return null;
    }
  }
}
