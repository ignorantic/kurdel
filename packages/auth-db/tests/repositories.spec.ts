import type { IDatabase } from '@kurdel/db';

import {
  DatabaseApiKeyRepository,
  DatabaseApiKeyUsageRecorder,
  DatabaseAuthUserRepository,
  DatabaseJwtSessionRepository,
  type ApiKeyHasher,
} from '../src/index.js';

describe('database auth repositories', () => {
  it('loads active identities and their current roles', async () => {
    const db = {
      get: vi.fn(async () => ({ id: 7, status: 'active' })),
      all: vi.fn()
        .mockResolvedValueOnce([{ name: 'admin' }, { name: 'editor' }])
        .mockResolvedValueOnce([{ name: 'users.manage' }]),
    } as unknown as IDatabase;
    const repository = new DatabaseAuthUserRepository(db);

    await expect(repository.findById(7)).resolves.toEqual({
      id: 7,
      roles: ['admin', 'editor'],
      permissions: ['users.manage'],
    });
    expect(db.get).toHaveBeenCalledWith({
      sql: 'SELECT id, status FROM users WHERE id = ?;',
      params: [7],
    });
  });

  it('does not load roles for disabled identities', async () => {
    const db = {
      get: vi.fn(async () => ({ id: 7, status: 'disabled' })),
      all: vi.fn(),
    } as unknown as IDatabase;

    await expect(new DatabaseAuthUserRepository(db).findById(7)).resolves.toBeNull();
    expect(db.all).not.toHaveBeenCalled();
  });

  it('hashes API keys before querying credential metadata', async () => {
    const db = {
      get: vi.fn(async () => ({
        id: 'credential-1',
        user_id: 7,
        status: 'active',
        expires_at: '2030-01-01T00:00:00.000Z',
      })),
    } as unknown as IDatabase;
    const hasher: ApiKeyHasher = { hash: vi.fn(() => 'digest') };
    const repository = new DatabaseApiKeyRepository(db, hasher);

    await expect(repository.findByKey('raw-key')).resolves.toEqual({
      id: 'credential-1',
      userId: 7,
      revoked: false,
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(hasher.hash).toHaveBeenCalledWith('raw-key');
    expect(db.get).toHaveBeenCalledWith(expect.objectContaining({ params: ['digest'] }));
  });

  it('loads server-side JWT revocation state', async () => {
    const db = {
      get: vi.fn(async () => ({
        id: 'session-1',
        user_id: 7,
        status: 'active',
        expires_at: '2030-01-01T00:00:00.000Z',
      })),
    } as unknown as IDatabase;
    const repository = new DatabaseJwtSessionRepository(db);

    await expect(repository.findById('session-1')).resolves.toEqual({
      id: 'session-1',
      userId: 7,
      revoked: false,
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(db.get).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('FROM jwt_sessions WHERE id = ?'),
      params: ['session-1'],
    }));
  });

  it('supports validated custom table names', async () => {
    const db = {
      get: vi.fn(async () => undefined),
    } as unknown as IDatabase;
    const hasher: ApiKeyHasher = { hash: () => 'digest' };
    const repository = new DatabaseApiKeyRepository(db, hasher, {
      apiKeys: 'application_api_keys',
    });

    await repository.findByKey('key');

    expect(db.get).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining('FROM application_api_keys'),
      })
    );
    expect(() => new DatabaseAuthUserRepository(db, { users: 'users; DROP TABLE users' })).toThrow(
      'Invalid auth database table name'
    );
  });

  it('records successful API key usage by stable credential ID', async () => {
    const db = { run: vi.fn(async () => undefined) } as unknown as IDatabase;
    const recorder = new DatabaseApiKeyUsageRecorder(db, {
      apiKeys: 'application_api_keys',
    });
    const usedAt = new Date('2026-08-15T12:00:00.000Z');

    await recorder.recordUsage('credential-1', usedAt);

    expect(db.run).toHaveBeenCalledWith({
      sql: 'UPDATE application_api_keys SET last_used_at = ? WHERE id = ?;',
      params: ['2026-08-15T12:00:00.000Z', 'credential-1'],
    });
  });
});
