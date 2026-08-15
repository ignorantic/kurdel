import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult, AuthStrategy } from 'src/domain/index.js';
import type {
  ApiKeyRepository,
  ApiKeyUsageRecorder,
  AuthUserRepository,
} from 'src/repositories/index.js';

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

/** Authenticates an API key and resolves its current application identity. */
export class ApiKeyStrategy implements AuthStrategy {
  constructor(private readonly options: ApiKeyStrategyOptions) {}

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

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }
}
