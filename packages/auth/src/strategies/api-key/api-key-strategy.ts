import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult, AuthStrategy } from 'src/domain/index.js';
import type {
  ApiKeyRepository,
  ApiKeyUsageRecorder,
  AuthUserRepository,
} from 'src/repositories/index.js';

/**
 * ## ApiKeyStrategyOptions
 *
 * Configures API-key authentication.
 */
export interface ApiKeyStrategyOptions {
  /** Name of the request header containing the API key. */
  header: string;

  /** Credential metadata source. It does not provide authorization data. */
  credentials: ApiKeyRepository;

  /** Source of truth for the current user and their authorization roles. */
  users: AuthUserRepository;

  /** Optional sink for recording successful credential usage. */
  usage?: ApiKeyUsageRecorder;

  /** Injectable clock keeps expiration behavior deterministic in tests. */
  now?: () => Date;
}

/**
 * ## ApiKeyStrategy
 *
 * Authenticates requests using opaque API keys.
 *
 * Responsibilities:
 * - resolve API-key credentials
 * - validate revocation and expiration
 * - resolve the current authenticated user
 * - optionally record successful credential usage
 *
 * Guarantees:
 * - revoked credentials never authenticate
 * - expired credentials never authenticate
 * - inactive or missing users never authenticate
 * - raw API keys are never exposed outside the strategy
 *
 * Non-responsibilities:
 * - API-key persistence
 * - user management
 * - authorization policy evaluation
 */
export class ApiKeyStrategy implements AuthStrategy {
  constructor(private readonly options: ApiKeyStrategyOptions) {}

   /**
   * Authenticates a request using the configured API-key header.
   *
   * Returns `null` when the credential is missing, invalid, revoked,
   * expired, or its associated user cannot be authenticated.
   */
  async authenticate(req: HttpRequest): Promise<AuthenticationResult | null> {
    const raw = req.headers?.[this.options.header.toLowerCase()];
    const key = Array.isArray(raw) ? raw[0] : raw;
    if (!key || typeof key !== 'string') return null;

    const credential = await this.options.credentials.findByKey(key);
    if (!credential || credential.revoked) return null;

    const authenticatedAt = this.now();
    if (credential.expiresAt && credential.expiresAt.getTime() <= authenticatedAt.getTime()) {
      return null;
    }

    const user = await this.options.users.findById(credential.userId);
    if (!user) return null;

    if (credential.id) {
      await this.options.usage?.recordUsage(credential.id, authenticatedAt);
    }

    return {
      user,
      credential: {
        type: 'api-key',
        ...(credential.id ? { id: credential.id } : {}),
      },
    };
  }

  /**
   * Returns the current time.
   *
   * Uses the injected clock when provided to keep authentication
   * deterministic in tests.
   */
  private now(): Date {
    return this.options.now?.() ?? new Date();
  }
}
