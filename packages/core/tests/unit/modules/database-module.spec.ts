import { describe, it, expect, vi } from 'vitest';
import { IDatabase } from '@kurdel/db';
import { DatabaseModule, NoopDatabase } from 'src/runtime/modules/database-module.js';

describe('DatabaseModule', () => {
  it('should register fake DB when disabled', async () => {
    const toInstance = vi.fn();
    const ioc = { bind: vi.fn(() => ({ toInstance })) } as any;

    const module = new DatabaseModule();
    await module.register(ioc, { db: false });

    expect(ioc.bind).toHaveBeenCalled();
    expect(toInstance).toHaveBeenCalledWith(expect.any(NoopDatabase));
  });

  it('should register DB when enabled', async () => {
    vi.mock('@kurdel/db', () => ({
      IDatabase: Symbol('IDatabase'),
      DBConnector: class {
        async run() {
          return { connected: true };
        }
      },
    }));

    const toInstance = vi.fn();
    const ioc = { bind: vi.fn(() => ({ toInstance })) } as any;

    const module = new DatabaseModule();
    await module.register(ioc, { db: true });

    expect(ioc.bind).toHaveBeenCalledWith(IDatabase);
    expect(toInstance).toHaveBeenCalledWith(expect.objectContaining({ connected: true }));
  });
});
