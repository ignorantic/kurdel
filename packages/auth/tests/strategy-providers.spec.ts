import type { HttpRequest } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';

import {
  apiKeyStrategy,
  AUTH_TOKENS,
  InMemoryAuthUserRepository,
  jwtStrategy,
  JwtService,
} from '../src/index.js';

function containerWith(values: Map<symbol, unknown>) {
  return {
    get: vi.fn((key: symbol) => values.get(key)),
  } as unknown as Container;
}

describe('built-in authentication strategy providers', () => {
  it('resolves JWT dependencies and an enabled session repository', async () => {
    const jwt = new JwtService({ secret: 'test-secret' });
    const users = new InMemoryAuthUserRepository([{ id: 1, roles: ['admin'] }]);
    const sessions = {
      findById: vi.fn(async () => ({ id: 'session-1', userId: 1, revoked: false })),
    };
    const container = containerWith(new Map([
      [AUTH_TOKENS.JwtService, jwt],
      [AUTH_TOKENS.UserRepository, users],
      [AUTH_TOKENS.JwtSessionRepository, sessions],
    ]));
    const provider = jwtStrategy({ sessions: true });
    if (!('useFactory' in provider)) throw new Error('Expected a factory provider');
    const strategy = provider.useFactory(container);
    const token = jwt.sign({ sub: 1, roles: [], jti: 'session-1' });

    await expect(strategy.authenticate({
      method: 'GET',
      url: '/',
      query: {},
      headers: { authorization: `Bearer ${token}` },
    })).resolves.toEqual(expect.objectContaining({ user: { id: 1, roles: ['admin'] } }));
    expect(container.get).toHaveBeenCalledWith(AUTH_TOKENS.JwtSessionRepository);
  });

  it('accepts a custom JWT session repository without resolving one', () => {
    const sessions = { findById: vi.fn(async () => null) };
    const container = containerWith(new Map([
      [AUTH_TOKENS.JwtService, new JwtService({ secret: 'test-secret' })],
      [AUTH_TOKENS.UserRepository, new InMemoryAuthUserRepository([])],
    ]));
    const provider = jwtStrategy({ sessions });
    if (!('useFactory' in provider)) throw new Error('Expected a factory provider');

    provider.useFactory(container);

    expect(container.get).not.toHaveBeenCalledWith(AUTH_TOKENS.JwtSessionRepository);
  });

  it('resolves API-key dependencies and optional usage recording', async () => {
    const usage = { recordUsage: vi.fn(async () => undefined) };
    const container = containerWith(new Map([
      [AUTH_TOKENS.ApiKeyRepository, {
        findByKey: vi.fn(async key => key === 'secret'
          ? { id: 'key-1', userId: 1, revoked: false }
          : null),
      }],
      [AUTH_TOKENS.UserRepository, new InMemoryAuthUserRepository([
        { id: 1, roles: ['admin'] },
      ])],
      [AUTH_TOKENS.ApiKeyUsageRecorder, usage],
    ]));
    const provider = apiKeyStrategy({ header: 'x-service-key', usage: true });
    if (!('useFactory' in provider)) throw new Error('Expected a factory provider');
    const strategy = provider.useFactory(container);
    const request: HttpRequest = {
      method: 'GET',
      url: '/',
      query: {},
      headers: { 'x-service-key': 'secret' },
    };

    await expect(strategy.authenticate(request)).resolves.toEqual({
      user: { id: 1, roles: ['admin'] },
      credential: { type: 'api-key', id: 'key-1' },
    });
    expect(usage.recordUsage).toHaveBeenCalledWith('key-1', expect.any(Date));
  });
});
