import { AuthorizationPolicyRegistry } from '../src/index.js';

describe('AuthorizationPolicyRegistry', () => {
  it('registers, resolves, and removes named policies', () => {
    const registry = new AuthorizationPolicyRegistry();
    const policy = { authorize: vi.fn(() => true) };

    registry.register('manage-users', policy);
    expect(registry.get('manage-users')).toBe(policy);

    registry.unregister('manage-users');
    expect(registry.get('manage-users')).toBeUndefined();
  });
});
