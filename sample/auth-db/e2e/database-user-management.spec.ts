import { DatabaseFactory, type Database } from '@kurdel/db';
import {
  ActiveUserNotFoundError,
  ApiKeyNotFoundError,
  DatabaseApiKeyService,
  DatabaseAuthEventStore,
  DatabaseJwtSessionRepository,
  DatabaseJwtSessionService,
  DatabasePasswordService,
  DatabaseUserService,
  Sha256ApiKeyHasher,
  UserNotFoundError,
  type UnknownRolesError,
} from '@kurdel/auth-db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';
import CreateAuthEvents from '../migrations/0003-create-auth-events.js';
import CreateRolePermissions from '../migrations/0004-create-role-permissions.js';
import CreateJwtSessions from '../migrations/0005-create-jwt-sessions.js';
import CreatePasswordCredentials from '../migrations/0006-create-password-credentials.js';
import CreateJwtRefreshTokens from '../migrations/0007-create-jwt-refresh-tokens.js';
import CreatePasswordResetTokens from '../migrations/0008-create-password-reset-tokens.js';

describe('database user management', () => {
  let db: Database;
  let users: DatabaseUserService;
  let apiKeys: DatabaseApiKeyService;
  let events: DatabaseAuthEventStore;
  let jwtSessions: DatabaseJwtSessionService;
  let passwords: DatabasePasswordService;
  const hasher = new Sha256ApiKeyHasher();

  beforeAll(async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    db = driver.connection;
    await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
    await new CreateAuthSchema(db).up();
    await new AddUserProfile(db).up();
    await new CreateAuthEvents(db).up();
    await new CreateRolePermissions(db).up();
    await new CreateJwtSessions(db).up();
    await new CreatePasswordCredentials(db).up();
    await new CreateJwtRefreshTokens(db).up();
    await new CreatePasswordResetTokens(db).up();
    await db.run({
      sql: 'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?);',
      params: [1, 'admin', 2, 'user'],
    });
    await db.run({
      sql: 'INSERT INTO permissions (id, name) VALUES (?, ?), (?, ?);',
      params: [1, 'users.view', 2, 'users.manage'],
    });
    users = new DatabaseUserService(db);
    events = new DatabaseAuthEventStore(db);
    apiKeys = new DatabaseApiKeyService(db, hasher, {}, events);
    jwtSessions = new DatabaseJwtSessionService(db, {}, events);
    passwords = new DatabasePasswordService(db, {
      hash: async password => `encoded:${password}`,
      verify: async (password, encodedHash) => encodedHash === `encoded:${password}`,
    }, {}, events);
  });

  afterAll(async () => {
    await db.close();
  });

  it('creates an active user and assigns existing roles atomically', async () => {
    const user = await users.create({
      name: 'Alice Example',
      email: 'ALICE@example.test',
      roles: ['user', 'admin'],
    });

    expect(user).toEqual({
      id: expect.any(Number),
      name: 'Alice Example',
      email: 'alice@example.test',
      status: 'active',
      roles: ['user', 'admin'],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    const assignments = await db.all({
      sql: [
        'SELECT roles.name',
        'FROM user_roles',
        'INNER JOIN roles ON roles.id = user_roles.role_id',
        'WHERE user_roles.user_id = ?',
        'ORDER BY roles.name;',
      ].join(' '),
      params: [user.id],
    });
    expect(assignments).toEqual([{ name: 'admin' }, { name: 'user' }]);
  });

  it('creates and revokes server-side JWT sessions', async () => {
    const user = await users.create({
      name: 'Session User',
      email: 'session@example.test',
      roles: ['user'],
    });
    const expiresAt = new Date(Date.now() + 60_000);
    const created = await jwtSessions.create(user.id, expiresAt);
    const repository = new DatabaseJwtSessionRepository(db);

    await expect(repository.findById(created.id)).resolves.toEqual({
      id: created.id,
      userId: user.id,
      revoked: false,
      expiresAt,
    });

    await jwtSessions.revoke(user.id, created.id);
    await expect(repository.findById(created.id)).resolves.toEqual({
      id: created.id,
      userId: user.id,
      revoked: true,
      expiresAt,
    });
    await expect(events.list({ userId: user.id })).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'jwt-session.created', credentialId: created.id }),
        expect.objectContaining({ type: 'jwt-session.revoked', credentialId: created.id }),
      ]),
    );
  });

  it('rotates hashed refresh tokens and manages active sessions', async () => {
    const user = await users.create({
      name: 'Refresh User',
      email: 'refresh@example.test',
      roles: ['user'],
    });
    const refreshExpiresAt = new Date(Date.now() + 60_000);
    const first = await jwtSessions.createRefreshable(user.id, refreshExpiresAt);

    expect(first.refreshToken).toMatch(/^kdl_rt_[A-Za-z0-9_-]{43}$/);
    const stored = await db.get({
      sql: 'SELECT token_hash FROM jwt_refresh_tokens WHERE session_id = ?;',
      params: [first.id],
    });
    expect(stored.token_hash).not.toBe(first.refreshToken);

    const refreshed = await jwtSessions.refresh(first.refreshToken);
    expect(refreshed).toMatchObject({ id: first.id, userId: user.id });
    expect(refreshed.refreshToken).not.toBe(first.refreshToken);
    await expect(jwtSessions.refresh(first.refreshToken)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
    await expect(jwtSessions.list(user.id)).resolves.toEqual([
      expect.objectContaining({ id: first.id, status: 'active' }),
    ]);

    await jwtSessions.revokeAll(user.id);
    await expect(jwtSessions.refresh(refreshed.refreshToken)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
    await expect(jwtSessions.list(user.id)).resolves.toEqual([
      expect.objectContaining({ id: first.id, status: 'revoked' }),
    ]);
  });

  it('changes passwords and revokes active sessions', async () => {
    const user = await users.create({
      name: 'Password User',
      email: 'password@example.test',
      roles: ['user'],
    });
    await passwords.set(user.id, 'old-password');
    const session = await jwtSessions.create(user.id, new Date(Date.now() + 60_000));

    await expect(passwords.change(user.id, 'wrong-password', 'new-password')).rejects.toThrow(
      'Current password is invalid'
    );
    await passwords.change(user.id, 'old-password', 'new-password');

    await expect(db.get({
      sql: 'SELECT password_hash FROM password_credentials WHERE user_id = ?;',
      params: [user.id],
    })).resolves.toEqual({ password_hash: 'encoded:new-password' });
    await expect(jwtSessions.list(user.id)).resolves.toEqual([
      expect.objectContaining({ id: session.id, status: 'revoked' }),
    ]);
    await expect(events.list({ userId: user.id })).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'password.changed' })])
    );
  });

  it('resets passwords with hashed single-use tokens', async () => {
    const user = await users.create({
      name: 'Reset User',
      email: 'reset@example.test',
      roles: ['user'],
    });
    await passwords.set(user.id, 'old-password');
    const session = await jwtSessions.create(user.id, new Date(Date.now() + 60_000));
    const reset = await passwords.createReset(user.id, new Date(Date.now() + 60_000));

    expect(reset.token).toMatch(/^kdl_pr_[A-Za-z0-9_-]{43}$/);
    const stored = await db.get({
      sql: 'SELECT token_hash FROM password_reset_tokens WHERE user_id = ?;',
      params: [user.id],
    });
    expect(stored.token_hash).not.toBe(reset.token);

    await passwords.reset(reset.token, 'reset-password');
    await expect(passwords.reset(reset.token, 'another-password')).rejects.toThrow(
      'Password reset token is invalid or expired'
    );
    await expect(db.get({
      sql: 'SELECT password_hash FROM password_credentials WHERE user_id = ?;',
      params: [user.id],
    })).resolves.toEqual({ password_hash: 'encoded:reset-password' });
    await expect(jwtSessions.list(user.id)).resolves.toEqual([
      expect.objectContaining({ id: session.id, status: 'revoked' }),
    ]);
    await expect(events.list({ userId: user.id })).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'password-reset.requested' }),
        expect.objectContaining({ type: 'password-reset.completed' }),
      ])
    );
  });

  it('lists available roles in a stable order', async () => {
    await expect(users.listRoles()).resolves.toEqual(['admin', 'user']);
  });

  it('assigns validated permissions to roles atomically', async () => {
    await expect(users.listPermissions()).resolves.toEqual(['users.manage', 'users.view']);
    await expect(
      users.setRolePermissions(1, ['users.manage', 'users.view'])
    ).resolves.toMatchObject({
      id: 1,
      permissions: ['users.manage', 'users.view'],
    });
    await expect(users.setRolePermissions(1, ['missing'])).rejects.toMatchObject({
      permissions: ['missing'],
    });
  });

  it('creates, renames, summarizes and removes roles', async () => {
    const role = await users.createRole('support');
    expect(role).toMatchObject({ name: 'support', userCount: 0 });
    const assigned = await users.create({
      name: 'Support Agent',
      email: 'support-agent@example.test',
      roles: ['support'],
    });
    await expect(users.listRoleSummaries()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: role.id, userCount: 1 })])
    );
    await expect(users.deleteRole(role.id)).rejects.toMatchObject({ userCount: 1 });
    await expect(users.renameRole(role.id, 'customer-support')).resolves.toMatchObject({
      name: 'customer-support',
      userCount: 1,
    });
    await users.update(assigned.id, { roles: ['user'] });
    await users.deleteRole(role.id);
    await expect(users.listRoles()).resolves.not.toContain('customer-support');
  });

  it('rejects unknown roles before creating a user', async () => {
    const before = await db.get({ sql: 'SELECT COUNT(*) AS count FROM users;', params: [] });

    await expect(
      users.create({
        name: 'Missing Role',
        email: 'missing@example.test',
        roles: ['missing'],
      })
    ).rejects.toEqual(expect.objectContaining<Partial<UnknownRolesError>>({ roles: ['missing'] }));

    const after = await db.get({ sql: 'SELECT COUNT(*) AS count FROM users;', params: [] });
    expect(after.count).toBe(before.count);
  });

  it('issues a random API key and persists only its hash', async () => {
    const user = await users.create({
      name: 'Key Owner',
      email: 'key-owner@example.test',
      roles: ['user'],
    });
    const credential = await apiKeys.create({
      userId: user.id,
      name: 'CLI key',
    });

    expect(credential.key).toMatch(/^kdl_[A-Za-z0-9_-]{43}$/);
    const stored = await db.get({
      sql: 'SELECT key_hash FROM api_keys WHERE id = ?;',
      params: [credential.id],
    });
    expect(stored.key_hash).toBe(hasher.hash(credential.key));
    expect(stored.key_hash).not.toBe(credential.key);
  });

  it('lists credential metadata and revokes keys without exposing their secrets', async () => {
    const user = await users.create({
      name: 'Credential Owner',
      email: 'credential-owner@example.test',
      roles: ['user'],
    });
    const active = await apiKeys.create({ userId: user.id, name: 'Active key' });
    await apiKeys.create({
      userId: user.id,
      name: 'Expired key',
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    });

    const before = await apiKeys.list(user.id);
    expect(before).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: active.id, name: 'Active key', status: 'active' }),
        expect.objectContaining({ name: 'Expired key', status: 'expired' }),
      ])
    );
    expect(before).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ key: active.key })])
    );

    await apiKeys.revoke(user.id, active.id);
    await expect(apiKeys.list(user.id)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: active.id, status: 'revoked' })])
    );
    await expect(apiKeys.revoke(user.id, 'missing')).rejects.toBeInstanceOf(ApiKeyNotFoundError);
    await expect(events.list({ userId: user.id })).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'api-key.issued',
          credentialId: active.id,
        }),
        expect.objectContaining({
          type: 'api-key.revoked',
          credentialId: active.id,
        }),
      ])
    );
  });

  it('rolls back API key mutations when audit persistence fails', async () => {
    const user = await users.create({
      name: 'Audit Failure Owner',
      email: 'audit-failure@example.test',
      roles: ['user'],
    });
    const auditFailure = {
      report: async () => {
        throw new Error('Audit persistence failed');
      },
    };
    const failingService = new DatabaseApiKeyService(db, hasher, {}, auditFailure);

    await expect(
      failingService.create({ userId: user.id, name: 'Rolled back key' })
    ).rejects.toThrow('Audit persistence failed');
    await expect(
      db.get({
        sql: 'SELECT COUNT(*) AS count FROM api_keys WHERE user_id = ?;',
        params: [user.id],
      })
    ).resolves.toEqual({ count: 0 });

    const credential = await apiKeys.create({ userId: user.id, name: 'Active key' });
    await expect(failingService.revoke(user.id, credential.id)).rejects.toThrow(
      'Audit persistence failed'
    );
    await expect(
      db.get({
        sql: 'SELECT status FROM api_keys WHERE id = ?;',
        params: [credential.id],
      })
    ).resolves.toEqual({ status: 'active' });
  });

  it('lists, loads and updates user profiles and access state', async () => {
    const user = await users.create({
      name: 'Before Update',
      email: 'before@example.test',
      roles: ['user'],
    });

    await expect(users.findById(user.id)).resolves.toMatchObject({
      name: 'Before Update',
      email: 'before@example.test',
    });
    await expect(
      users.update(user.id, {
        name: 'After Update',
        email: 'AFTER@example.test',
        status: 'disabled',
        roles: ['admin'],
      })
    ).resolves.toMatchObject({
      name: 'After Update',
      email: 'after@example.test',
      status: 'disabled',
      roles: ['admin'],
    });

    const page = await users.list({ limit: 10, offset: 0, status: 'disabled' });
    expect(page).toMatchObject({ total: 1, limit: 10, offset: 0 });
    expect(page.users).toEqual([expect.objectContaining({ id: user.id })]);
  });

  it('rejects duplicate email addresses', async () => {
    await users.create({ name: 'First', email: 'unique@example.test', roles: ['user'] });
    await expect(
      users.create({
        name: 'Second',
        email: 'UNIQUE@example.test',
        roles: ['user'],
      })
    ).rejects.toMatchObject({ email: 'unique@example.test' });
  });

  it('searches and sorts users by supported fields', async () => {
    await users.create({ name: 'Zulu Search', email: 'zulu-search@example.test', roles: ['user'] });
    await users.create({
      name: 'Alpha Search',
      email: 'alpha-search@example.test',
      roles: ['user'],
    });
    const result = await users.list({
      limit: 10,
      offset: 0,
      search: 'SEARCH',
      sortBy: 'name',
      sortDirection: 'asc',
    });
    expect(result.users.map(user => user.name)).toEqual(['Alpha Search', 'Zulu Search']);
    expect(result.total).toBe(2);
  });

  it('updates and deletes user selections atomically', async () => {
    const first = await users.create({
      name: 'Bulk First',
      email: 'bulk-first@example.test',
      roles: ['user'],
    });
    const second = await users.create({
      name: 'Bulk Second',
      email: 'bulk-second@example.test',
      roles: ['user'],
    });
    const updated = await users.bulkUpdate({
      userIds: [first.id, second.id],
      status: 'disabled',
      addRoles: ['admin'],
      removeRoles: ['user'],
    });
    expect(updated).toEqual([
      expect.objectContaining({ id: first.id, status: 'disabled', roles: ['admin'] }),
      expect.objectContaining({ id: second.id, status: 'disabled', roles: ['admin'] }),
    ]);
    await users.bulkDelete([first.id, second.id]);
    await expect(users.findById(first.id)).rejects.toBeInstanceOf(UserNotFoundError);
    await expect(users.findById(second.id)).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('returns dashboard statistics for users, credentials and failures', async () => {
    const statsUser = await users.create({
      name: 'Stats User',
      email: 'stats@example.test',
      roles: ['user'],
    });
    await apiKeys.create({ userId: statsUser.id, name: 'Stats key' });
    await events.report({
      type: 'authentication.failed',
      occurredAt: new Date(),
      strategy: 'api-key',
      reason: 'invalid-credential',
    });
    await expect(users.dashboardStats()).resolves.toMatchObject({
      users: {
        total: expect.any(Number),
        active: expect.any(Number),
        disabled: expect.any(Number),
      },
      apiKeys: {
        active: expect.any(Number),
        revoked: expect.any(Number),
        expired: expect.any(Number),
      },
      failedAuthenticationsLast24Hours: 1,
    });
  });

  it('deletes a user together with role assignments and credentials', async () => {
    const user = await users.create({
      name: 'Delete Me',
      email: 'delete-me@example.test',
      roles: ['user'],
    });
    await apiKeys.create({ userId: user.id, name: 'Disposable key' });

    await users.delete(user.id);

    await expect(users.findById(user.id)).rejects.toBeInstanceOf(UserNotFoundError);
    await expect(
      db.get({
        sql: 'SELECT user_id FROM user_roles WHERE user_id = ?;',
        params: [user.id],
      })
    ).resolves.toBeUndefined();
    await expect(
      db.get({
        sql: 'SELECT id FROM api_keys WHERE user_id = ?;',
        params: [user.id],
      })
    ).resolves.toBeUndefined();
  });

  it('does not issue credentials for unknown users', async () => {
    await expect(apiKeys.create({ userId: 404, name: 'Missing' })).rejects.toBeInstanceOf(
      ActiveUserNotFoundError
    );
  });
});
