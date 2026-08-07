import { log } from 'node:console';
import crypto from 'node:crypto';

/**
 * ## JwtHeader
 * Standard JWT header metadata.
 */
interface JwtHeader {
  alg: 'HS256';
  typ: 'JWT';
}

/**
 * ## JwtPayload
 * Standard JWT claims plus application-level fields.
 */
export interface JwtPayload {
  sub: string | number;
  roles: string[];
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

/**
 * ## JwtServiceOptions
 * The minimal configuration required to sign and verify JWT tokens.
 */
export interface JwtServiceOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresIn?: number; // seconds
}

/**
 * ## JwtService
 *
 * Lightweight JWT (HS256) implementation with zero dependencies.
 * Provides signing, decoding and verification.
 */
export class JwtService {
  constructor(private readonly opts: JwtServiceOptions) {}

  /**
   * Signs a new JWT token with the configured HS256 secret.
   */
  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };

    const iat = Math.floor(Date.now() / 1000);
    const exp = this.opts.expiresIn ? iat + this.opts.expiresIn : undefined;

    const fullPayload = {
      ...payload,
      iat,
      exp,
      iss: this.opts.issuer,
      aud: this.opts.audience,
    } as JwtPayload;

    const encodedHeader = this.b64(JSON.stringify(header));
    const encodedPayload = this.b64(JSON.stringify(fullPayload));

    const signature = this.signSegment(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decodes the payload **without validating the signature**.
   * Useful for debugging or optional preview.
   */
  decode(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } catch {
      return null;
    }
  }

  /**
   * Verifies signature + exp/nbf/iss/aud constraints.
   * Returns the decoded payload or throws an Error.
   */
  verify(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signature] = parts;
    const computedSign = this.signSegment(`${headerB64}.${payloadB64}`);

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSign))) {
      throw new Error('Invalid token signature');
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && now >= payload.exp) {
      throw new Error('Token expired');
    }
    if (payload.nbf && now < payload.nbf) {
      throw new Error('Token not yet valid');
    }
    if (this.opts.issuer && payload.iss !== this.opts.issuer) {
      throw new Error('Invalid issuer');
    }
    if (this.opts.audience && payload.aud !== this.opts.audience) {
      throw new Error('Invalid audience');
    }

    return payload;
  }

  // ─────────────────────────────────────────────

  private b64(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  private signSegment(data: string): string {
    return crypto
      .createHmac('sha256', this.opts.secret)
      .update(data)
      .digest('base64url');
  }
}
