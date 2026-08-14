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
    const strategy = new ApiKeyStrategy({
      header: 'X-API-Key',
      credentials: new InMemoryApiKeyRepository({ key: { id: 'credential-1', userId: 1 } }),
      users,
      now: () => now,
    });

    await expect(strategy.authenticate(request('key'))).resolves.toEqual({
      user: { id: 1, roles: ['admin'] },
      credential: { id: 'credential-1', type: 'api-key' },
    });
  });

  it.each([
    ['unknown', { key: { userId: 1 } }],
    ['revoked', { revoked: { userId: 1, revoked: true } }],
    ['expired', { expired: { userId: 1, expiresAt: new Date('2025-12-31') } }],
  ])('rejects an %s credential', async (key, credentials) => {
    const strategy = new ApiKeyStrategy({
      header: 'x-api-key',
      credentials: new InMemoryApiKeyRepository(credentials),
      users,
      now: () => now,
    });

    await expect(strategy.authenticate(request(key))).resolves.toBeNull();
  });

  it('rejects a credential whose identity no longer exists', async () => {
    const strategy = new ApiKeyStrategy({
      header: 'x-api-key',
      credentials: new InMemoryApiKeyRepository({ key: { userId: 404 } }),
      users,
    });

    await expect(strategy.authenticate(request('key'))).resolves.toBeNull();
  });
});
