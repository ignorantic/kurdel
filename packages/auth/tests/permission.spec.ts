import { hasPermission, permissionPolicy } from '../src/index.js';

describe('permission authorization helpers', () => {
  const user = { id: 1, roles: ['support'], permissions: ['users.view', 'users.update'] };

  it('checks resolved user permissions', () => {
    expect(hasPermission(user, 'users.view')).toBe(true);
    expect(hasPermission(user, 'users.delete')).toBe(false);
    expect(hasPermission({ id: 2, roles: [] }, 'users.view')).toBe(false);
  });

  it('creates a reusable permission policy', async () => {
    const policy = permissionPolicy('users.update');
    expect(await policy.authorize({ strategy: 'test', user }, {} as any)).toBe(true);
  });
});
