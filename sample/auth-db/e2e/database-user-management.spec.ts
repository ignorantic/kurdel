import { DatabaseFactory, type IDatabase } from '@kurdel/db';
import {
  ActiveUserNotFoundError,
  ApiKeyNotFoundError,
  DatabaseApiKeyService,
  DatabaseAuthEventStore,
  DatabaseUserService,
  Sha256ApiKeyHasher,
  UserNotFoundError,
  type UnknownRolesError,
} from '@kurdel/auth-db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';
import CreateAuthEvents from '../migrations/0003-create-auth-events.js';

describe('database user management', () => {
  let db: IDatabase;
  let users: DatabaseUserService;
  let apiKeys: DatabaseApiKeyService;
  let events: DatabaseAuthEventStore;
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
    await db.run({
      sql: 'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?);',
      params: [1, 'admin', 2, 'user'],
    });
    users = new DatabaseUserService(db);
    events = new DatabaseAuthEventStore(db);
    apiKeys = new DatabaseApiKeyService(db, hasher, {}, events);
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

  it('lists available roles in a stable order', async () => {
    await expect(users.listRoles()).resolves.toEqual(['admin', 'user']);
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
