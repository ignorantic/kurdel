import type { AuthContext } from '@kurdel/auth';

import { manageUsersPolicy, viewUserPolicy } from '../src/authorization-policies.js';

const context = (id: string) => ({ params: { id } }) as any;

const auth = (id: number, roles: string[], credentialType = 'api-key'): AuthContext => ({
  strategy: 'api-key',
  user: { id, roles },
  credential: { type: credentialType },
});

describe('sample authorization policies', () => {
  it('allows only API-key authenticated administrators to manage users', async () => {
    expect(await manageUsersPolicy.authorize(auth(1, ['admin']), context('2'))).toBe(true);
    expect(await manageUsersPolicy.authorize(auth(1, ['admin'], 'jwt'), context('2'))).toBe(false);
    expect(await manageUsersPolicy.authorize(auth(2, ['user']), context('2'))).toBe(false);
  });

  it('allows users to view themselves and administrators to view anyone', async () => {
    expect(await viewUserPolicy.authorize(auth(2, ['user']), context('2'))).toBe(true);
    expect(await viewUserPolicy.authorize(auth(2, ['user']), context('1'))).toBe(false);
    expect(await viewUserPolicy.authorize(auth(1, ['admin']), context('2'))).toBe(true);
  });
});
