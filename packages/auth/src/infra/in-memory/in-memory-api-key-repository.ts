import type { ApiKeyCredential, ApiKeyRepository } from 'src/repositories/index.js';

/** In-memory credential source intended for tests, demos and bootstrap code. */
export class InMemoryApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly keys: Record<string, ApiKeyCredential>) {}

  findByKey(key: string): ApiKeyCredential | null {
    return this.keys[key] ?? null;
  }
}
