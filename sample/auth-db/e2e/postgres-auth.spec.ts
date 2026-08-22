import { PostgresDB, type Database } from '@kurdel/db';
import {
  DatabaseJwtSessionRepository,
  DatabaseJwtSessionService,
  DatabasePasswordCredentialRepository,
  DatabasePasswordService,
  DatabaseUserService,
} from '@kurdel/auth-db';
import { MigrationLock, MigrationLockedError } from '@kurdel/migrations';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';
import CreateAuthEvents from '../migrations/0003-create-auth-events.js';
import CreateRolePermissions from '../migrations/0004-create-role-permissions.js';
import CreateJwtSessions from '../migrations/0005-create-jwt-sessions.js';
import CreatePasswordCredentials from '../migrations/0006-create-password-credentials.js';
import CreateJwtRefreshTokens from '../migrations/0007-create-jwt-refresh-tokens.js';
import CreatePasswordResetTokens from '../migrations/0008-create-password-reset-tokens.js';

const connectionString = process.env.POSTGRES_TEST_URL;
const describePostgres = connectionString ? describe : describe.skip;

describePostgres('PostgreSQL auth database integration', () => {
  let db: Database;

  beforeAll(async () => {
    const postgres = new PostgresDB({ connectionString });
    await postgres.connect();
    db = postgres;
    await new CreateAuthSchema(db).up();
    await new AddUserProfile(db).up();
    await new CreateAuthEvents(db).up();
    await new CreateRolePermissions(db).up();
    await new CreateJwtSessions(db).up();
    await new CreateJwtRefreshTokens(db).up();
    await new CreatePasswordCredentials(db).up();
    await new CreatePasswordResetTokens(db).up();
    await db.run({
      sql: 'INSERT INTO roles (name) VALUES (?), (?);',
      params: ['admin', 'user'],
    });
  });

  afterAll(async () => {
    if (!db) return;
    await new CreatePasswordResetTokens(db).down();
    await new CreatePasswordCredentials(db).down();
    await new CreateJwtRefreshTokens(db).down();
    await new CreateJwtSessions(db).down();
    await new CreateRolePermissions(db).down();
    await new CreateAuthEvents(db).down();
    await new AddUserProfile(db).down();
    await new CreateAuthSchema(db).down();
    await db.run({ sql: 'DROP TABLE IF EXISTS migration_locks;', params: [] });
    await db.close();
  });

  it('runs user and revocable session workflows on PostgreSQL', async () => {
    const users = new DatabaseUserService(db);
    const user = await users.create({
      name: 'Postgres User',
      email: 'postgres@example.test',
      roles: ['user'],
    });
    await expect(users.findById(user.id)).resolves.toEqual(user);

    await db.run({
      sql: [
        'INSERT INTO api_keys (id, user_id, key_hash, name, status, expires_at)',
        'VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?);',
      ].join(' '),
      params: [
        'active', user.id, 'active-hash', 'Active', 'active', null,
        'revoked', user.id, 'revoked-hash', 'Revoked', 'revoked', null,
        'expired', user.id, 'expired-hash', 'Expired', 'active', '2020-01-01T00:00:00.000Z',
      ],
    });
    await db.run({
      sql: 'INSERT INTO auth_events (type, occurred_at) VALUES (?, ?), (?, ?);',
      params: [
        'authentication.failed', new Date().toISOString(),
        'authentication.failed', '2020-01-01T00:00:00.000Z',
      ],
    });
    await expect(users.dashboardStats()).resolves.toEqual({
      users: { total: 1, active: 1, disabled: 0 },
      apiKeys: { active: 1, revoked: 1, expired: 1 },
      failedAuthenticationsLast24Hours: 1,
    });

    const passwords = new DatabasePasswordService(db, {
      hash: async password => `hashed:${password}`,
      verify: async (password, encoded) => encoded === `hashed:${password}`,
    });
    await passwords.set(user.id, 'postgres-password');
    await expect(
      new DatabasePasswordCredentialRepository(db).findByLogin('POSTGRES@example.test')
    ).resolves.toEqual({ userId: user.id, passwordHash: 'hashed:postgres-password' });
    await passwords.change(user.id, 'postgres-password', 'changed-password');
    await expect(
      new DatabasePasswordCredentialRepository(db).findByLogin('POSTGRES@example.test')
    ).resolves.toEqual({ userId: user.id, passwordHash: 'hashed:changed-password' });

    const sessions = new DatabaseJwtSessionService(db);
    const created = await sessions.create(user.id, new Date(Date.now() + 60_000));
    const repository = new DatabaseJwtSessionRepository(db);
    await expect(repository.findById(created.id)).resolves.toEqual({
      id: created.id,
      userId: user.id,
      revoked: false,
      expiresAt: new Date(created.expiresAt),
    });
    await sessions.revoke(user.id, created.id);
    await expect(repository.findById(created.id)).resolves.toEqual(expect.objectContaining({
      revoked: true,
    }));

    const renewable = await sessions.createRefreshable(
      user.id,
      new Date(Date.now() + 60_000),
    );
    const refreshed = await sessions.refresh(renewable.refreshToken);
    expect(refreshed).toMatchObject({ id: renewable.id, userId: user.id });
    await expect(sessions.refresh(renewable.refreshToken)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );

    const reset = await passwords.createReset(user.id, new Date(Date.now() + 60_000));
    await passwords.reset(reset.token, 'reset-password');
    await expect(passwords.reset(reset.token, 'reused-password')).rejects.toThrow(
      'Password reset token is invalid or expired',
    );
    await expect(
      new DatabasePasswordCredentialRepository(db).findByLogin('POSTGRES@example.test')
    ).resolves.toEqual({ userId: user.id, passwordHash: 'hashed:reset-password' });
    await expect(sessions.refresh(refreshed.refreshToken)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
  });

  it('serializes competing PostgreSQL migration operations', async () => {
    const first = new MigrationLock(db);
    const second = new MigrationLock(db);
    await first.initialize();

    await first.acquire();
    await expect(second.acquire()).rejects.toBeInstanceOf(MigrationLockedError);
    await first.release();
    await expect(second.acquire()).resolves.toBeUndefined();
    await second.release();
  });
});
