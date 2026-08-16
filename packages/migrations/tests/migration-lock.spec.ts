import { DatabaseFactory, type IDatabase } from '@kurdel/db';

import { MigrationLock, MigrationLockedError } from '../src/index.js';

describe('MigrationLock', () => {
  it('acquires and releases a portable database lease', async () => {
    const get = vi.fn(async query => ({ owner: query.params[1] }));
    const run = vi.fn(async () => undefined);
    const db = { dialect: 'postgres', get, run } as unknown as IDatabase;
    const lock = new MigrationLock(db, 60_000);

    await lock.initialize();
    await lock.acquire(new Date('2026-08-16T12:00:00.000Z'));
    await lock.release();

    expect(run).toHaveBeenNthCalledWith(1, expect.objectContaining({
      sql: expect.stringContaining('expires_at TIMESTAMPTZ'),
    }));
    expect(get).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('ON CONFLICT(id) DO UPDATE'),
      params: expect.arrayContaining([
        1,
        expect.any(String),
        '2026-08-16T12:01:00.000Z',
        '2026-08-16T12:00:00.000Z',
      ]),
    }));
    expect(run).toHaveBeenLastCalledWith(expect.objectContaining({
      sql: 'DELETE FROM migration_locks WHERE id = ? AND owner = ?;',
    }));
  });

  it('rejects acquisition while another owner holds the lease', async () => {
    const db = {
      dialect: 'sqlite',
      get: vi.fn(async () => undefined),
    } as unknown as IDatabase;

    await expect(new MigrationLock(db).acquire()).rejects.toBeInstanceOf(MigrationLockedError);
  });

  it('serializes competing operations on SQLite', async () => {
    const driver = DatabaseFactory.createDriver({ type: 'sqlite', filename: ':memory:' });
    await driver.connect();
    if (!driver.connection) throw new Error('SQLite connection was not created');
    const db = driver.connection;
    const first = new MigrationLock(db);
    const second = new MigrationLock(db);
    await first.initialize();

    await first.acquire();
    await expect(second.acquire()).rejects.toBeInstanceOf(MigrationLockedError);
    await first.release();
    await expect(second.acquire()).resolves.toBeUndefined();
    await second.release();
    await db.close();
  });
});
