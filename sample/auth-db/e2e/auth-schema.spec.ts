import { DatabaseFactory, type IDatabase } from '@kurdel/db';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';

describe('auth database schema', () => {
  let db: IDatabase;

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

    const tables = await db.all({
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
      params: [],
    });
    expect(tables.map((table: { name: string }) => table.name)).toEqual([
      'api_keys',
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

    await db.run({
      sql: "INSERT INTO users (id, status) VALUES (?, ?);",
      params: [1, 'active'],
    });
    await db.run({
      sql: "INSERT INTO roles (id, name) VALUES (?, ?);",
      params: [1, 'root'],
    });
    await db.run({
      sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
      params: [1, 1],
    });
    await expect(db.run({
      sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
      params: [1, 1],
    })).rejects.toThrow();
  });

  it('rolls the auth schema back in dependency order', async () => {
    const migration = new CreateAuthSchema(db);
    await migration.down();

    const tables = await db.all({
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
      params: [],
    });
    expect(tables).toEqual([]);
  });
});
