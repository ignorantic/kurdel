import { DatabaseFactory, type Database } from '@kurdel/db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';
import CreateAuthEvents from '../migrations/0003-create-auth-events.js';
import CreateRolePermissions from '../migrations/0004-create-role-permissions.js';
import CreateJwtSessions from '../migrations/0005-create-jwt-sessions.js';
import CreatePasswordCredentials from '../migrations/0006-create-password-credentials.js';
import CreateJwtRefreshTokens from '../migrations/0007-create-jwt-refresh-tokens.js';
import CreatePasswordResetTokens from '../migrations/0008-create-password-reset-tokens.js';

describe('auth database schema', () => {
  let db: Database;

  beforeAll(async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    db = driver.connection;
    await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
  });

  afterAll(async () => {
    await db.close();
  });

  it('creates normalized auth tables with constraints and indexes', async () => {
    const migration = new CreateAuthSchema(db);
    await migration.up();
    await new AddUserProfile(db).up();
    await new CreateAuthEvents(db).up();
    await new CreateRolePermissions(db).up();
    await new CreateJwtSessions(db).up();
    await new CreateJwtRefreshTokens(db).up();
    await new CreatePasswordCredentials(db).up();
    await new CreatePasswordResetTokens(db).up();

    const tables = await db.all({
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
      params: [],
    });
    expect(tables.map((table: { name: string }) => table.name)).toEqual([
      'api_keys',
      'auth_events',
      'jwt_refresh_tokens',
      'jwt_sessions',
      'password_credentials',
      'password_reset_tokens',
      'permissions',
      'role_permissions',
      'roles',
      'user_roles',
      'users',
    ]);

    const userRoleForeignKeys = await db.all({
      sql: 'PRAGMA foreign_key_list(user_roles);',
      params: [],
    });
    expect(userRoleForeignKeys).toHaveLength(2);
    expect(userRoleForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: 'users', from: 'user_id', on_delete: 'CASCADE' }),
        expect.objectContaining({ table: 'roles', from: 'role_id', on_delete: 'CASCADE' }),
      ])
    );

    const apiKeyIndexes = await db.all({
      sql: 'PRAGMA index_list(api_keys);',
      params: [],
    });
    expect(apiKeyIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'api_keys_key_hash_index', unique: 1 }),
        expect.objectContaining({ name: 'api_keys_user_id_index', unique: 0 }),
      ])
    );

    const passwordForeignKeys = await db.all({
      sql: 'PRAGMA foreign_key_list(password_credentials);',
      params: [],
    });
    expect(passwordForeignKeys).toEqual([
      expect.objectContaining({ table: 'users', from: 'user_id', on_delete: 'CASCADE' }),
    ]);

    const refreshTokenForeignKeys = await db.all({
      sql: 'PRAGMA foreign_key_list(jwt_refresh_tokens);',
      params: [],
    });
    expect(refreshTokenForeignKeys).toEqual([
      expect.objectContaining({ table: 'jwt_sessions', from: 'session_id', on_delete: 'CASCADE' }),
    ]);

    await db.run({
      sql: 'INSERT INTO users (id, name, email, status) VALUES (?, ?, ?, ?);',
      params: [1, 'Root User', 'root@example.test', 'active'],
    });
    await db.run({
      sql: 'INSERT INTO roles (id, name) VALUES (?, ?);',
      params: [1, 'root'],
    });
    await db.run({
      sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
      params: [1, 1],
    });
    await expect(
      db.run({
        sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
        params: [1, 1],
      })
    ).rejects.toThrow();
  });

  it('rolls the auth schema back in dependency order', async () => {
    const migration = new CreateAuthSchema(db);
    await new CreatePasswordResetTokens(db).down();
    await new CreatePasswordCredentials(db).down();
    await new CreateJwtRefreshTokens(db).down();
    await new CreateJwtSessions(db).down();
    await new CreateRolePermissions(db).down();
    await new CreateAuthEvents(db).down();
    await new AddUserProfile(db).down();
    await migration.down();

    const tables = await db.all({
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
      params: [],
    });
    expect(tables).toEqual([]);
  });
});
