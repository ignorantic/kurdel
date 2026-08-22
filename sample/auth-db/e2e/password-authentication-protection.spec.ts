import { PasswordAuthenticationBlockedError } from '@kurdel/auth';
import { DatabasePasswordAuthenticationProtection } from '@kurdel/auth-db';
import { DatabaseFactory, type Database } from '@kurdel/db';

import CreatePasswordAuthenticationAttempts from '../migrations/0009-create-password-authentication-attempts.js';

describe('password authentication protection', () => {
  let db: Database;

  beforeAll(async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    db = driver.connection;
    await new CreatePasswordAuthenticationAttempts(db).up();
  });

  afterAll(async () => db.close());

  it('atomically locks a normalized login at the configured threshold', async () => {
    const protection = new DatabasePasswordAuthenticationProtection({ db, options: {
      maxFailures: 2,
      windowMs: 60_000,
      lockMs: 60_000,
    } });

    await protection.recordFailure(' User@Example.Test ');
    await expect(protection.recordFailure('user@example.test')).rejects.toBeInstanceOf(
      PasswordAuthenticationBlockedError
    );
    await expect(protection.assertAllowed('USER@example.test')).rejects.toBeInstanceOf(
      PasswordAuthenticationBlockedError
    );

    const attempts = await db.all({
      sql: 'SELECT login, failed_attempts FROM password_authentication_attempts;',
      params: [],
    });
    expect(attempts).toEqual([{ login: 'user@example.test', failed_attempts: 2 }]);

    await protection.recordSuccess('user@example.test');
    await expect(protection.assertAllowed('user@example.test')).resolves.toBeUndefined();
  });
});
