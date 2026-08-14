import { DatabaseFactory, type IDatabase } from '@kurdel/db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import { DatabaseApiKeyRepository } from '../src/database-api-key-repository.js';
import { DatabaseApiKeyService, ActiveUserNotFoundError } from '../src/database-api-key-service.js';
import { DatabaseUserService, UnknownRolesError } from '../src/database-user-service.js';

describe('database user management', () => {
  let db: IDatabase;
  let users: DatabaseUserService;
  let apiKeys: DatabaseApiKeyService;

  beforeAll(async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    db = driver.connection;
    await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
    await new CreateAuthSchema(db).up();
    await db.run({
      sql: 'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?);',
      params: [1, 'admin', 2, 'user'],
    });
    users = new DatabaseUserService(db);
    apiKeys = new DatabaseApiKeyService(db);
  });

  afterAll(async () => {
    await db.close();
  });

  it('creates an active user and assigns existing roles atomically', async () => {
    const user = await users.create({ roles: ['user', 'admin'] });

    expect(user).toEqual({
      id: expect.any(Number),
      status: 'active',
      roles: ['user', 'admin'],
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

  it('rejects unknown roles before creating a user', async () => {
    const before = await db.get({ sql: 'SELECT COUNT(*) AS count FROM users;', params: [] });

    await expect(users.create({ roles: ['missing'] })).rejects.toEqual(
      expect.objectContaining<Partial<UnknownRolesError>>({ roles: ['missing'] })
    );

    const after = await db.get({ sql: 'SELECT COUNT(*) AS count FROM users;', params: [] });
    expect(after.count).toBe(before.count);
  });

  it('issues a random API key and persists only its hash', async () => {
    const user = await users.create({ roles: ['user'] });
    const credential = await apiKeys.create({
      userId: user.id,
      name: 'CLI key',
    });

    expect(credential.key).toMatch(/^kdl_[A-Za-z0-9_-]{43}$/);
    const stored = await db.get({
      sql: 'SELECT key_hash FROM api_keys WHERE id = ?;',
      params: [credential.id],
    });
    expect(stored.key_hash).toBe(DatabaseApiKeyRepository.hash(credential.key));
    expect(stored.key_hash).not.toBe(credential.key);
  });

  it('does not issue credentials for unknown users', async () => {
    await expect(apiKeys.create({ userId: 404, name: 'Missing' })).rejects.toBeInstanceOf(
      ActiveUserNotFoundError
    );
  });
});
