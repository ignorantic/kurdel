import type { HttpRequest } from '@kurdel/common';

import {
  ApiKeyStrategy,
  InMemoryApiKeyRepository,
  InMemoryAuthUserRepository,
} from '../src/index.js';

const request = (key?: string): HttpRequest => ({
  method: 'GET',
  url: '/',
  query: {},
  headers: key ? { 'x-api-key': key } : {},
});

describe('ApiKeyStrategy', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const users = new InMemoryAuthUserRepository([
    { id: 1, roles: ['admin'] },
  ]);

  it('resolves authorization data from the user repository', async () => {
    const usage = { recordUsage: vi.fn(async () => undefined) };
    const strategy = new ApiKeyStrategy({
      header: 'X-API-Key',
      credentials: new InMemoryApiKeyRepository({ key: { id: 'credential-1', userId: 1 } }),
      users,
      usage,
      now: () => now,
    });

    await expect(strategy.authenticate(request('key'))).resolves.toEqual({
      user: { id: 1, roles: ['admin'] },
      credential: { id: 'credential-1', type: 'api-key' },
    });
    expect(usage.recordUsage).toHaveBeenCalledWith('credential-1', now);
  });

  it.each([
    ['unknown', { key: { userId: 1 } }],
    ['revoked', { revoked: { userId: 1, revoked: true } }],
    ['expired', { expired: { userId: 1, expiresAt: new Date('2025-12-31') } }],
  ])('rejects an %s credential', async (key, credentials) => {
    const usage = { recordUsage: vi.fn() };
    const strategy = new ApiKeyStrategy({
      header: 'x-api-key',
      credentials: new InMemoryApiKeyRepository(credentials),
      users,
      usage,
      now: () => now,
    });

    await expect(strategy.authenticate(request(key))).resolves.toBeNull();
    expect(usage.recordUsage).not.toHaveBeenCalled();
  });

  it('rejects a credential whose identity no longer exists', async () => {
    const usage = { recordUsage: vi.fn() };
    const strategy = new ApiKeyStrategy({
      header: 'x-api-key',
      credentials: new InMemoryApiKeyRepository({ key: { id: 'orphaned', userId: 404 } }),
      users,
      usage,
    });

    await expect(strategy.authenticate(request('key'))).resolves.toBeNull();
    expect(usage.recordUsage).not.toHaveBeenCalled();
  });

  it('authenticates credentials without stable IDs without recording usage', async () => {
    const usage = { recordUsage: vi.fn() };
    const strategy = new ApiKeyStrategy({
      header: 'x-api-key',
      credentials: new InMemoryApiKeyRepository({ key: { userId: 1 } }),
      users,
      usage,
      now: () => now,
    });

    await expect(strategy.authenticate(request('key'))).resolves.toEqual({
      user: { id: 1, roles: ['admin'] },
      credential: { type: 'api-key' },
    });
    expect(usage.recordUsage).not.toHaveBeenCalled();
  });
});
