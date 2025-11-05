import { describe, it, expect, vi } from 'vitest';
import type { ServerAdapter } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';
import { RuntimeApplication } from 'src/app/runtime-application.js';
import { LifecycleModule } from 'src/modules/lifecycle-module.js';

/**
 * Verifies that RunningServer.raw() correctly proxies to ServerAdapter.raw()
 * when available, and remains undefined otherwise.
 */
describe('Application lifecycle - RunningServer.raw()', () => {
  it('exposes raw() when adapter provides it', async () => {
    const sentinel = { name: 'raw-server' };

    class TestAdapter implements ServerAdapter<unknown, typeof sentinel> {
      on = vi.fn();
      listen(_: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        done();
      }
      close = vi.fn(async () => {});
      raw<T = unknown>(): T | undefined {
        return sentinel as unknown as T;
      }
    }

    const AdapterModule = {
      providers: [
        {
          provide: TOKENS.ServerAdapter,
          useFactory: () => new TestAdapter(),
          singleton: true,
        },
      ],
    };

    const app = new RuntimeApplication({
      modules: [new LifecycleModule(), AdapterModule],
      db: false,
    });

    await app.bootstrap();

    const running = app.listen(0, () => {});
    expect(running.raw).toBeDefined();
    expect(running.raw!()).toBe(sentinel);

    await running.close();
  });

  it('does not expose raw() when adapter lacks it', async () => {
    class TestAdapter implements ServerAdapter<unknown, unknown> {
      on = vi.fn();
      listen(_: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        done();
      }
      close = vi.fn(async () => {});
      // no raw()
    }

    const AdapterModule = {
      providers: [
        {
          provide: TOKENS.ServerAdapter,
          useFactory: () => new TestAdapter(),
          singleton: true,
        },
      ],
    };

    const app = new RuntimeApplication({
      modules: [new LifecycleModule(), AdapterModule],
      db: false,
    });

    await app.bootstrap();

    const running = app.listen(0, () => {});
    expect(running.raw).toBeUndefined();

    await running.close();
  });
});
