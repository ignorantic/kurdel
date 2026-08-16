import type { AuthContext } from '@kurdel/auth';

import { manageUsersPolicy, viewUserPolicy } from '../src/authorization-policies.js';

const context = (id: string) => ({ params: { id } }) as any;

const auth = (id: number, permissions: string[], credentialType = 'api-key'): AuthContext => ({
  strategy: 'api-key',
  user: { id, roles: [], permissions },
  credential: { type: credentialType },
});

describe('sample authorization policies', () => {
  it('allows only API-key identities with the user management permission', async () => {
    expect(await manageUsersPolicy.authorize(auth(1, ['users.manage']), context('2'))).toBe(true);
    expect(await manageUsersPolicy.authorize(auth(1, ['users.manage'], 'jwt'), context('2'))).toBe(
      false
    );
    expect(await manageUsersPolicy.authorize(auth(2, ['users.view.self']), context('2'))).toBe(
      false
    );
  });

  it('distinguishes self-service and unrestricted view permissions', async () => {
    expect(await viewUserPolicy.authorize(auth(2, ['users.view.self']), context('2'))).toBe(true);
    expect(await viewUserPolicy.authorize(auth(2, ['users.view.self']), context('1'))).toBe(false);
    expect(await viewUserPolicy.authorize(auth(1, ['users.view.any']), context('2'))).toBe(true);
  });
});
