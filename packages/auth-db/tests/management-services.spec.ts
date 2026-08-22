import type { Database } from '@kurdel/db';

import {
  DatabaseApiKeyService,
  DatabasePasswordCredentialRepository,
  DatabasePasswordService,
  DatabaseUserService,
  PasswordUserNotFoundError,
  type ApiKeyHasher,
} from '../src/index.js';

describe('database auth management services', () => {
  it('loads roles through validated custom table names', async () => {
    const db = {
      all: vi.fn(async () => [{ name: 'admin' }, { name: 'user' }]),
    } as unknown as Database;
    const service = new DatabaseUserService({ db, tables: { roles: 'application_roles' } });

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
    } as unknown as Database;
    const hasher: ApiKeyHasher = { hash: key => key };
    const service = new DatabaseApiKeyService({ db, hasher, tables: {
      users: 'application_users', apiKeys: 'application_api_keys',
    },
    });

    await expect(service.list(7)).resolves.toEqual([]);
    expect(db.get).toHaveBeenCalledWith({
      sql: 'SELECT id, status FROM application_users WHERE id = ?;',
      params: [7],
    });
    expect(db.all).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining('FROM application_api_keys'),
      })
    );
  });

  it('rejects unsafe table names before executing management queries', () => {
    const db = {} as Database;
    const hasher: ApiKeyHasher = { hash: key => key };

    expect(() => new DatabaseUserService({ db, tables: { users: 'users; DROP TABLE users' } })).toThrow(
      'Invalid auth database table name'
    );
    expect(() => new DatabaseApiKeyService({ db, hasher, tables: { apiKeys: 'api keys' } })).toThrow(
      'Invalid auth database table name'
    );
  });

  it('resolves password credentials by normalized email', async () => {
    const db = {
      get: vi.fn(async () => ({ user_id: 7, password_hash: 'encoded' })),
    } as unknown as Database;
    const repository = new DatabasePasswordCredentialRepository({ db });

    await expect(repository.findByLogin(' Admin@Example.Test ')).resolves.toEqual({
      userId: 7,
      passwordHash: 'encoded',
    });
    expect(db.get).toHaveBeenCalledWith(
      expect.objectContaining({
        params: ['Admin@Example.Test'],
        sql: expect.stringContaining('LOWER(users.email) = LOWER(?)'),
      })
    );
  });

  it('sets a password transactionally for an existing user', async () => {
    const transaction = {
      get: vi.fn(async () => ({ id: 7 })),
      run: vi.fn(async () => undefined),
    };
    const db = {
      transaction: vi.fn(async callback => callback(transaction)),
    } as unknown as Database;
    const service = new DatabasePasswordService({ db, hasher: {
      hash: vi.fn(async () => 'encoded'),
      verify: vi.fn(async () => true),
    } });

    await service.set(7, 'demo-password');
    expect(transaction.run).toHaveBeenCalledWith(
      expect.objectContaining({
        params: [7, 'encoded'],
        sql: expect.stringContaining('ON CONFLICT(user_id) DO UPDATE'),
      })
    );
  });

  it('does not create a password credential for a missing user', async () => {
    const transaction = { get: vi.fn(async () => undefined), run: vi.fn() };
    const db = {
      transaction: vi.fn(async callback => callback(transaction)),
    } as unknown as Database;
    const service = new DatabasePasswordService({ db, hasher: {
      hash: vi.fn(async () => 'encoded'),
      verify: vi.fn(async () => true),
    } });

    await expect(service.set(404, 'demo-password')).rejects.toBeInstanceOf(
      PasswordUserNotFoundError
    );
    expect(transaction.run).not.toHaveBeenCalled();
  });
});
