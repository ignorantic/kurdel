import { describe, it, expect, vi } from 'vitest';
import { Database } from '@kurdel/db';
import { TOKENS } from '@kurdel/core/tokens';

import { DatabaseModule, NoopDatabase } from 'src/modules/database-module.js';

const { close } = vi.hoisted(() => ({ close: vi.fn() }));

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
      Database: Symbol('Database'),
      DBConnector: class {
        async run() {
          return { connected: true, close };
        }
      },
    }));

    const toInstance = vi.fn();
    const onShutdown: Array<() => Promise<void>> = [];
    const ioc = {
      bind: vi.fn(() => ({ toInstance })),
      get: vi.fn(token => token === TOKENS.OnShutdown ? onShutdown : undefined),
    } as any;

    const module = new DatabaseModule();
    await module.register(ioc, { db: true });

    expect(ioc.bind).toHaveBeenCalledWith(Database);
    expect(toInstance).toHaveBeenCalledWith(expect.objectContaining({ connected: true }));
    expect(onShutdown).toHaveLength(1);

    await onShutdown[0]();
    expect(close).toHaveBeenCalledOnce();
  });
});
