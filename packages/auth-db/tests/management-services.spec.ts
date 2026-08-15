import type { IDatabase } from '@kurdel/db';

import {
  DatabaseApiKeyService,
  DatabaseUserService,
  type ApiKeyHasher,
} from '../src/index.js';

describe('database auth management services', () => {
  it('loads roles through validated custom table names', async () => {
    const db = {
      all: vi.fn(async () => [{ name: 'admin' }, { name: 'user' }]),
    } as unknown as IDatabase;
    const service = new DatabaseUserService(db, { roles: 'application_roles' });

    await expect(service.listRoles()).resolves.toEqual(['admin', 'user']);
    expect(db.all).toHaveBeenCalledWith({
      sql: 'SELECT name FROM application_roles ORDER BY name;',
      params: [],
    });
  });

  it('lists API key metadata through custom user and credential tables', async () => {
    const db = {
      get: vi.fn(async () => ({ id: 7, status: 'active' })),
      all: vi.fn(async () => []),
    } as unknown as IDatabase;
    const hasher: ApiKeyHasher = { hash: key => key };
    const service = new DatabaseApiKeyService(db, hasher, {
      users: 'application_users',
      apiKeys: 'application_api_keys',
    });

    await expect(service.list(7)).resolves.toEqual([]);
    expect(db.get).toHaveBeenCalledWith({
      sql: 'SELECT id, status FROM application_users WHERE id = ?;',
      params: [7],
    });
    expect(db.all).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('FROM application_api_keys'),
    }));
  });

  it('rejects unsafe table names before executing management queries', () => {
    const db = {} as IDatabase;
    const hasher: ApiKeyHasher = { hash: key => key };

    expect(() => new DatabaseUserService(db, { users: 'users; DROP TABLE users' }))
      .toThrow('Invalid auth database table name');
    expect(() => new DatabaseApiKeyService(db, hasher, { apiKeys: 'api keys' }))
      .toThrow('Invalid auth database table name');
  });
});
