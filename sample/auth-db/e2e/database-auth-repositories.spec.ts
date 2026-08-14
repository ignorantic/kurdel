import { DatabaseFactory, type IDatabase } from '@kurdel/db';
import {
  DatabaseApiKeyRepository,
  DatabaseAuthUserRepository,
  Sha256ApiKeyHasher,
} from '@kurdel/auth-db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';

describe('database auth repositories', () => {
  let db: IDatabase;
  let users: DatabaseAuthUserRepository;
  let apiKeys: DatabaseApiKeyRepository;
  const hasher = new Sha256ApiKeyHasher();

  beforeAll(async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    db = driver.connection;
    await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
    await new CreateAuthSchema(db).up();
    await new AddUserProfile(db).up();

    await db.run({
      sql: 'INSERT INTO users (id, name, email, status) VALUES (?, ?, ?, ?), (?, ?, ?, ?);',
      params: [
        1, 'Active User', 'active@example.test', 'active',
        2, 'Disabled User', 'disabled@example.test', 'disabled',
      ],
    });
    await db.run({
      sql: 'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?);',
      params: [1, 'admin', 2, 'editor'],
    });
    await db.run({
      sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?), (?, ?);',
      params: [1, 1, 1, 2],
    });
    await db.run({
      sql: [
        'INSERT INTO api_keys',
        '(id, user_id, key_hash, name, status, expires_at)',
        'VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?);',
      ].join(' '),
      params: [
        'active', 1, hasher.hash('active-key'), 'Active', 'active', null,
        'revoked', 1, hasher.hash('revoked-key'), 'Revoked', 'revoked', null,
        'expired', 1, hasher.hash('expired-key'), 'Expired', 'active', '2020-01-01T00:00:00.000Z',
      ],
    });

    users = new DatabaseAuthUserRepository(db);
    apiKeys = new DatabaseApiKeyRepository(db, hasher);
  });

  afterAll(async () => {
    await db.close();
  });

  it('loads the current roles for an active user', async () => {
    await expect(users.findById(1)).resolves.toEqual({
      id: 1,
      roles: ['admin', 'editor'],
    });
  });

  it('rejects disabled and unknown users', async () => {
    await expect(users.findById(2)).resolves.toBeNull();
    await expect(users.findById(404)).resolves.toBeNull();
  });

  it('resolves API key metadata without storing the raw key', async () => {
    await expect(apiKeys.findByKey('active-key')).resolves.toEqual({
      userId: 1,
      revoked: false,
      expiresAt: undefined,
    });
    await expect(apiKeys.findByKey('unknown-key')).resolves.toBeNull();

    const stored = await db.get({
      sql: "SELECT key_hash FROM api_keys WHERE id = 'active';",
      params: [],
    });
    expect(stored.key_hash).not.toBe('active-key');
  });

  it('exposes revoked and expired credentials to the strategy policy', async () => {
    await expect(apiKeys.findByKey('revoked-key')).resolves.toMatchObject({ revoked: true });
    await expect(apiKeys.findByKey('expired-key')).resolves.toMatchObject({
      revoked: false,
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    });
  });
});
