import type { AuthUser, HttpRequest } from '@kurdel/common';

import type { AuthStrategy } from 'src/domain/index.js';
import type { ApiKeyRepository, AuthUserRepository } from 'src/repositories/index.js';

export interface ApiKeyStrategyOptions {
  /** Name of the request header containing the API key. */
  header: string;
  /** Credential metadata source. It does not provide authorization data. */
  credentials: ApiKeyRepository;
  /** Source of truth for the current user and their authorization roles. */
  users: AuthUserRepository;
  /** Injectable clock keeps expiration behavior deterministic in tests. */
  now?: () => Date;
}

/** Authenticates an API key and resolves its current application identity. */
export class ApiKeyStrategy implements AuthStrategy {
  constructor(private readonly options: ApiKeyStrategyOptions) {}

  async authenticate(req: HttpRequest): Promise<AuthUser | null> {
    const raw = req.headers?.[this.options.header.toLowerCase()];
    const key = Array.isArray(raw) ? raw[0] : raw;
    if (!key || typeof key !== 'string') return null;

    const credential = await this.options.credentials.findByKey(key);
    if (!credential || credential.revoked) return null;

    if (credential.expiresAt && credential.expiresAt.getTime() <= this.now().getTime()) {
      return null;
    }

    return await this.options.users.findById(credential.userId);
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }
}
