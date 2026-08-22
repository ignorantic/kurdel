import type { AuthUserRepository, PasswordCredentialRepository } from '../src/index.js';
import {
  PasswordAuthenticationBlockedError,
  PasswordAuthenticationService,
  ScryptPasswordHasher,
  type PasswordAuthenticationProtection,
} from '../src/index.js';

describe('password authentication', () => {
  it('hashes passwords with a random salt and verifies them', async () => {
    const hasher = new ScryptPasswordHasher({ cost: 1024 });
    const first = await hasher.hash('correct horse battery staple');
    const second = await hasher.hash('correct horse battery staple');

    expect(first).not.toBe(second);
    await expect(hasher.verify('correct horse battery staple', first)).resolves.toBe(true);
    await expect(hasher.verify('wrong password', first)).resolves.toBe(false);
    await expect(hasher.verify('password', 'invalid')).resolves.toBe(false);
  });

  it('returns the current user only for a valid credential', async () => {
    const hasher = new ScryptPasswordHasher({ cost: 1024 });
    const passwordHash = await hasher.hash('demo-password');
    const credentials: PasswordCredentialRepository = {
      findByLogin: vi.fn(async login =>
        login === 'admin@example.test' ? { userId: 1, passwordHash } : null
      ),
    };
    const users: AuthUserRepository = {
      findById: vi.fn(async id => ({ id, roles: ['admin'] })),
    };
    const service = new PasswordAuthenticationService({ credentials, users, hasher });

    await expect(service.authenticate('admin@example.test', 'demo-password')).resolves.toEqual({
      id: 1,
      roles: ['admin'],
    });
    await expect(service.authenticate('admin@example.test', 'wrong-password')).resolves.toBeNull();
    expect(users.findById).toHaveBeenCalledTimes(1);
  });

  it('performs password work for an unknown login', async () => {
    const hasher = { hash: vi.fn(async () => 'unused'), verify: vi.fn(async () => true) };
    const service = new PasswordAuthenticationService({
      credentials: { findByLogin: async () => null },
      users: { findById: async () => null },
      hasher,
    });

    await expect(service.authenticate('missing@example.test', 'password')).resolves.toBeNull();
    expect(hasher.hash).toHaveBeenCalledWith('password');
    expect(hasher.verify).not.toHaveBeenCalled();
  });

  it('records failures without revealing whether a login exists and clears them on success', async () => {
    const hasher = new ScryptPasswordHasher({ cost: 1024 });
    const passwordHash = await hasher.hash('demo-password');
    const protection: PasswordAuthenticationProtection = {
      assertAllowed: vi.fn(),
      recordFailure: vi.fn(),
      recordSuccess: vi.fn(),
    };
    const service = new PasswordAuthenticationService({
      credentials: {
        findByLogin: async login => login === 'known' ? { userId: 1, passwordHash } : null,
      },
      users: { findById: async id => ({ id, roles: [] }) },
      hasher,
      protection,
    });

    await service.authenticate('missing', 'wrong');
    await service.authenticate('known', 'wrong');
    await service.authenticate('known', 'demo-password');

    expect(protection.assertAllowed).toHaveBeenCalledTimes(3);
    expect(protection.recordFailure).toHaveBeenCalledWith('missing');
    expect(protection.recordFailure).toHaveBeenCalledWith('known');
    expect(protection.recordSuccess).toHaveBeenCalledWith('known');
  });

  it('stops before credential lookup when a login is blocked', async () => {
    const retryAt = new Date(Date.now() + 60_000);
    const credentials = { findByLogin: vi.fn() };
    const service = new PasswordAuthenticationService({
      credentials,
      users: { findById: vi.fn() },
      hasher: { hash: vi.fn(), verify: vi.fn() },
      protection: {
        assertAllowed: () => { throw new PasswordAuthenticationBlockedError(retryAt); },
        recordFailure: vi.fn(),
        recordSuccess: vi.fn(),
      },
    });

    await expect(service.authenticate('blocked', 'password')).rejects.toMatchObject({ retryAt });
    expect(credentials.findByLogin).not.toHaveBeenCalled();
  });
});
