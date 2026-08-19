import crypto from 'node:crypto';

/**
 * ## JwtHeader
 *
 * Standard JWT header used by {@link JwtService}.
 */
interface JwtHeader {
  alg: 'HS256';
  typ: 'JWT';
}

/**
 * ## JwtPayload
 *
 * Standard JWT claims together with application-defined claims.
 *
 * The payload is intentionally extensible to support application-specific
 * authentication metadata.
 */
export interface JwtPayload {
  /** Subject (`sub`) identifying the authenticated principal. */
  sub: string | number;

  /** Roles embedded into the signed token. */
  roles: string[];

  /** Issued-at time (`iat`), expressed as Unix time in seconds. */
  iat?: number;

  /** Expiration time (`exp`), expressed as Unix time in seconds. */
  exp?: number;

  /** Not-before time (`nbf`), expressed as Unix time in seconds. */
  nbf?: number;

  /** Expected token issuer (`iss`). */
  iss?: string;

  /** Intended token audience (`aud`). */
  aud?: string;

  /** Additional application-defined claims. */
  [key: string]: unknown;
}

/**
 * ## JwtServiceOptions
 *
 * Configures JWT signing and verification.
 */
export interface JwtServiceOptions {
  /** Secret used for HS256 signing. */
  secret: string;

  /** Expected issuer claim. */
  issuer?: string;

  /** Expected audience claim. */
  audience?: string;

  /**
   * Default token lifetime in seconds.
   *
   * When omitted, generated tokens do not receive an `exp` claim.
   */
  expiresIn?: number;
}

/**
 * ## JwtService
 *
 * Signs and verifies JSON Web Tokens using the HS256 algorithm.
 *
 * Responsibilities:
 * - create signed JWT tokens
 * - verify token integrity and registered claims
 * - decode JWT payloads without verification when explicitly requested
 *
 * Guarantees:
 * - every generated token is signed with the configured secret
 * - verification validates the signature before returning claims
 * - configured issuer, audience, and lifetime constraints are enforced
 *
 * Non-responsibilities:
 * - user authentication
 * - authorization
 * - session persistence
 * - key rotation
 */
export class JwtService {
  constructor(private readonly opts: JwtServiceOptions) {}

  /**
   * Creates and signs a JWT.
   *
   * Standard claims (`iat`, `exp`, `iss`, `aud`) are populated
   * automatically from the configured options.
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
   * Decodes a JWT payload without verifying its signature.
   *
   * The returned payload must be treated as untrusted until
   * {@link verify} succeeds.
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
   * Verifies a JWT and returns its decoded payload.
   *
   * Validation includes:
   * - signature
   * - expiration (`exp`)
   * - not-before (`nbf`)
   * - issuer (`iss`) when configured
   * - audience (`aud`) when configured
   *
   * @throws Error
   * If the token is malformed, has an invalid signature,
   * or violates any configured validation constraint.
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
