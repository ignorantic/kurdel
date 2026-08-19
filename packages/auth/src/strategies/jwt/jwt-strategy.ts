import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult, AuthStrategy } from 'src/domain/index.js';
import type { AuthUserRepository, JwtSessionRepository } from 'src/repositories/index.js';
import type { JwtService } from 'src/strategies/index.js';

/**
 * ## JwtStrategyOptions
 *
 * Configures JWT authentication.
 */
export interface JwtStrategyOptions {
  /**
   * Request header containing the JWT.
   *
   * @default "authorization"
   */
  header?: string;

   /**
   * Authentication scheme expected in the header.
   *
   * @default "Bearer"
   */
  prefix?: string;

  /**
   * Optional repository for server-side session validation.
   *
   * When configured, every JWT must reference an active session
   * through its `jti` claim.
   */
  sessions?: JwtSessionRepository;
}

/**
 * ## JwtStrategy
 *
 * Authenticates requests using JSON Web Tokens.
 *
 * Responsibilities:
 * - extract a JWT from the configured request header
 * - verify the token signature and claims
 * - optionally validate the referenced server-side session
 * - resolve the current authenticated user
 *
 * Guarantees:
 * - invalid tokens never authenticate
 * - revoked or expired sessions never authenticate
 * - inactive or missing users never authenticate
 * - verified JWT claims are exposed through the authentication result
 *
 * Non-responsibilities:
 * - JWT creation
 * - session persistence
 * - authorization policy evaluation
 * - user management
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

   /**
   * Authenticates a request using the configured JWT header.
   *
   * Returns `null` when the token is missing, malformed, invalid,
   * references a revoked or expired session, or its associated
   * user cannot be authenticated.
   */
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
