import type { HttpRequest } from '@kurdel/common';

import {
  InMemoryAuthUserRepository,
  JwtService,
  JwtStrategy,
} from '../src/index.js';

const request = (authorization: string): HttpRequest => ({
  method: 'GET',
  url: '/',
  query: {},
  headers: { authorization },
});

describe('JwtStrategy', () => {
  const service = new JwtService({ secret: 'test-secret' });

  it('uses only sub from the token and loads current roles from the repository', async () => {
    const token = service.sign({ sub: 1, roles: ['stale-token-role'], jti: 'token-1' });
    const users = new InMemoryAuthUserRepository([
      { id: 1, roles: ['current-database-role'] },
    ]);
    const strategy = new JwtStrategy(service, users);

    await expect(strategy.authenticate(request(`Bearer ${token}`))).resolves.toEqual({
      user: { id: 1, roles: ['current-database-role'] },
      credential: { id: 'token-1', type: 'jwt' },
      claims: expect.objectContaining({
        sub: 1,
        roles: ['stale-token-role'],
        jti: 'token-1',
      }),
    });
  });

  it('rejects a valid token when the current identity does not exist', async () => {
    const token = service.sign({ sub: 404, roles: ['admin'] });
    const strategy = new JwtStrategy(service, new InMemoryAuthUserRepository([]));

    await expect(strategy.authenticate(request(`Bearer ${token}`))).resolves.toBeNull();
  });

  it('accepts only active server-side sessions when a session repository is configured', async () => {
    const token = service.sign({ sub: 1, roles: [], jti: 'session-1' });
    const users = new InMemoryAuthUserRepository([{ id: 1, roles: ['user'] }]);
    const sessions = {
      findById: vi.fn(async () => ({
        id: 'session-1',
        userId: 1,
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      })),
    };
    const strategy = new JwtStrategy(service, users, { sessions });

    await expect(strategy.authenticate(request(`Bearer ${token}`)))
      .resolves.toEqual(expect.objectContaining({ user: { id: 1, roles: ['user'] } }));
    expect(sessions.findById).toHaveBeenCalledWith('session-1');
  });

  it.each([
    ['missing jti', { sub: 1, roles: [] }, null],
    ['missing session', { sub: 1, roles: [], jti: 'missing' }, null],
    ['revoked session', { sub: 1, roles: [], jti: 'session-1' }, {
      id: 'session-1', userId: 1, revoked: true,
    }],
    ['another user session', { sub: 1, roles: [], jti: 'session-1' }, {
      id: 'session-1', userId: 2, revoked: false,
    }],
    ['expired session', { sub: 1, roles: [], jti: 'session-1' }, {
      id: 'session-1', userId: 1, revoked: false, expiresAt: new Date(0),
    }],
    ['invalid session expiration', { sub: 1, roles: [], jti: 'session-1' }, {
      id: 'session-1', userId: 1, revoked: false, expiresAt: new Date(Number.NaN),
    }],
  ])('rejects a token with %s', async (_case, payload, session) => {
    const token = service.sign(payload);
    const users = new InMemoryAuthUserRepository([{ id: 1, roles: ['user'] }]);
    const strategy = new JwtStrategy(service, users, {
      sessions: { findById: vi.fn(async () => session) },
    });

    await expect(strategy.authenticate(request(`Bearer ${token}`))).resolves.toBeNull();
  });
});
