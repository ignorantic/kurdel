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
    const token = service.sign({ sub: 1, roles: ['stale-token-role'] });
    const users = new InMemoryAuthUserRepository([
      { id: 1, roles: ['current-database-role'] },
    ]);
    const strategy = new JwtStrategy(service, users);

    await expect(strategy.authenticate(request(`Bearer ${token}`))).resolves.toEqual({
      id: 1,
      roles: ['current-database-role'],
    });
  });

  it('rejects a valid token when the current identity does not exist', async () => {
    const token = service.sign({ sub: 404, roles: ['admin'] });
    const strategy = new JwtStrategy(service, new InMemoryAuthUserRepository([]));

    await expect(strategy.authenticate(request(`Bearer ${token}`))).resolves.toBeNull();
  });
});
