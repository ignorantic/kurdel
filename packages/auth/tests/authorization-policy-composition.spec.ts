import { allOf, anyOf, not, type AuthorizationPolicy } from '../src/index.js';

describe('authorization policy composition', () => {
  const auth = { strategy: 'test', user: { id: 1, roles: [] } };
  const ctx = {} as any;
  const allow: AuthorizationPolicy = { authorize: () => true };
  const deny = (reason: string): AuthorizationPolicy => ({
    authorize: () => ({ allowed: false, reason }),
  });

  it('requires every policy and preserves the first denial reason', async () => {
    const skipped = { authorize: vi.fn(() => true) };

    await expect(allOf(allow, deny('account-disabled'), skipped).authorize(auth, ctx))
      .resolves.toEqual({ allowed: false, reason: 'account-disabled' });
    expect(skipped.authorize).not.toHaveBeenCalled();
  });

  it('grants access when any policy succeeds', async () => {
    await expect(anyOf(deny('missing-owner'), allow).authorize(auth, ctx))
      .resolves.toEqual({ allowed: true });
  });

  it('returns the last diagnostic reason when every alternative denies access', async () => {
    await expect(anyOf(deny('missing-owner'), deny('missing-admin')).authorize(auth, ctx))
      .resolves.toEqual({ allowed: false, reason: 'missing-admin' });
  });

  it('inverts a policy and can describe the resulting denial', async () => {
    await expect(not(allow, 'anonymous-only').authorize(auth, ctx))
      .resolves.toEqual({ allowed: false, reason: 'anonymous-only' });
    await expect(not(deny('ignored')).authorize(auth, ctx))
      .resolves.toEqual({ allowed: true });
  });
});
