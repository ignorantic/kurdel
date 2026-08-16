import type { Database } from '@kurdel/db';

import { MigrationManager, type MigrationLock } from '../src/index.js';
import type { MigrationLoader } from '../src/migration-loader.js';
import type { MigrationRegistry } from '../src/migration-registry.js';

class AppliedMigration {}
class PendingMigration {}

describe('MigrationManager', () => {
  it('reports applied, pending, and missing migration files', async () => {
    const connection = { close: vi.fn() } as unknown as Database;
    const registry = {
      history: Promise.resolve([
        { id: 1, name: 'AppliedMigration', batch: 1 },
        { id: 2, name: 'MissingMigration', batch: 2 },
      ]),
    } as unknown as MigrationRegistry;
    const loader = {
      load: vi.fn(async () => [AppliedMigration, PendingMigration]),
    } as unknown as MigrationLoader;
    const lock = {
      initialize: vi.fn(), acquire: vi.fn(), release: vi.fn(),
    } as unknown as MigrationLock;
    const manager = new MigrationManager(connection, registry, loader, lock);

    await expect(manager.status()).resolves.toEqual([
      { name: 'AppliedMigration', state: 'applied', batch: 1 },
      { name: 'PendingMigration', state: 'pending' },
      { name: 'MissingMigration', state: 'missing', batch: 2 },
    ]);
    expect(lock.acquire).not.toHaveBeenCalled();
  });

  it('always releases the lock when migration discovery fails', async () => {
    const connection = {} as Database;
    const registry = { all: Promise.resolve([]) } as unknown as MigrationRegistry;
    const loader = {
      load: vi.fn(async () => { throw new Error('load failed'); }),
    } as unknown as MigrationLoader;
    const lock = {
      initialize: vi.fn(), acquire: vi.fn(), release: vi.fn(),
    } as unknown as MigrationLock;
    const manager = new MigrationManager(connection, registry, loader, lock);

    await expect(manager.run()).rejects.toThrow('load failed');
    expect(lock.acquire).toHaveBeenCalledOnce();
    expect(lock.release).toHaveBeenCalledOnce();
  });
});
