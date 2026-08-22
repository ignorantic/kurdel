import { PasswordAuthenticationBlockedError } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { DatabasePasswordAuthenticationProtection } from '../src/index.js';

describe('DatabasePasswordAuthenticationProtection', () => {
  it('normalizes logins and clears attempts after successful authentication', async () => {
    const db = {
      get: vi.fn(async () => undefined),
      run: vi.fn(async () => undefined),
    } as unknown as Database;
    const protection = new DatabasePasswordAuthenticationProtection(db);

    await protection.assertAllowed(' Admin@Example.Test ');
    await protection.recordSuccess(' Admin@Example.Test ');

    expect(db.get).toHaveBeenCalledWith(expect.objectContaining({ params: ['admin@example.test'] }));
    expect(db.run).toHaveBeenCalledWith(expect.objectContaining({ params: ['admin@example.test'] }));
  });

  it('blocks the threshold attempt with a retry time', async () => {
    const retryAt = new Date(Date.now() + 60_000).toISOString();
    const db = {
      get: vi.fn(async () => ({ locked_until: retryAt })),
    } as unknown as Database;
    const protection = new DatabasePasswordAuthenticationProtection(db, {}, { maxFailures: 3 });

    await expect(protection.recordFailure('user@example.test')).rejects.toEqual(
      expect.objectContaining({ retryAt: new Date(retryAt) })
    );
    expect(db.get).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('ON CONFLICT(login) DO UPDATE'),
      params: expect.arrayContaining(['user@example.test', 3]),
    }));
  });

  it('rejects attempts while a lock is active', async () => {
    const retryAt = new Date(Date.now() + 60_000).toISOString();
    const db = { get: vi.fn(async () => ({ locked_until: retryAt })) } as unknown as Database;
    const protection = new DatabasePasswordAuthenticationProtection(db);

    await expect(protection.assertAllowed('user@example.test')).rejects.toBeInstanceOf(
      PasswordAuthenticationBlockedError
    );
  });
});
