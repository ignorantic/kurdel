import { describe, it, expect } from 'vitest';
import type { ServerAdapter } from '@kurdel/core/http';
import type { AppConfig } from '@kurdel/core/app';

import { RuntimeApplication } from 'src/app/runtime-application.js';
import { LifecycleModule } from 'src/modules/lifecycle-module.js';

/**
 * Verifies that RunningServer.raw() is proxied from the adapter when available.
 */
describe('Application lifecycle – RunningServer.raw()', () => {
  it('exposes raw() when adapter provides it', async () => {
    // Minimal adapter with raw() returning a sentinel object
    const sentinel = { name: 'raw-server' };

    class TestAdapter implements ServerAdapter<unknown, typeof sentinel> {
      private handler?: (req: unknown, res: typeof sentinel) => void | Promise<void>;

      on(cb: (req: unknown, res: typeof sentinel) => void | Promise<void>) {
        this.handler = cb;
      }

      listen(_: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        // immediately signal "ready"
        done();
      }

      raw<T = unknown>(): T | undefined {
        return sentinel as unknown as T;
      }
    }

    const app = new RuntimeApplication({
      modules: [new LifecycleModule()],
      server: TestAdapter,
      db: false,
    } as AppConfig);
    await app.bootstrap();

    const running = app.listen(0, () => {});
    expect(running.raw).toBeDefined();
    expect(running.raw!()).toBe(sentinel);

    await running.close();
  });

  it('does not expose raw() when adapter lacks it', async () => {
    class TestAdapter implements ServerAdapter<unknown, unknown> {
      private handler?: (req: unknown, res: unknown) => void | Promise<void>;

      on(cb: (req: unknown, res: unknown) => void | Promise<void>) {
        this.handler = cb;
      }

      listen(port: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        // immediately signal "ready"
        done();
      }
    }

    const app = new RuntimeApplication({
      modules: [new LifecycleModule()],
      server: TestAdapter,
      db: false,
    } as AppConfig);
    await app.bootstrap();

    const running = app.listen(0, () => {});
    expect(running.raw).toBeUndefined();

    await running.close();
  });
});
