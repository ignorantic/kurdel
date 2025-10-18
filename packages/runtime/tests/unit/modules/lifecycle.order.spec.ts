import { describe, it, expect, vi } from 'vitest';
import { type AppConfig, TOKENS } from '@kurdel/core/app';
import type { ServerAdapter } from '@kurdel/core/http';

import { RuntimeApplication } from 'src/app/runtime-application.js';
import { LifecycleModule } from 'src/modules/lifecycle-module.js';

/**
 * Verifies that:
 *  - OnStart hooks run before the user onReady callback.
 *  - close() runs OnShutdown hooks in reverse order.
 *  - adapter.listen is called once, and adapter.close is called on close().
 */
describe('Application lifecycle – order & wiring', () => {
  it('runs OnStart before user callback and OnShutdown in reverse after close()', async () => {
    // Fake adapter that just invokes its callback immediately
    const listenSpy = vi.fn<(port: number) => void>();
    const closeSpy = vi.fn<() => Promise<void>>().mockResolvedValue();

    class TestAdapter implements ServerAdapter {
      private handler?: (req: unknown, res: unknown) => void | Promise<void>;

      on(cb: (req: unknown, res: unknown) => void | Promise<void>) {
        this.handler = cb;
      }

      listen(port: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        listenSpy(port);
        // immediately signal "ready"
        done();
      }

      async close(): Promise<void> {
        await closeSpy();
      }
    }

    const app = new RuntimeApplication({
      modules: [new LifecycleModule()],
      serverAdapter: new TestAdapter(),
      db: false,
    } as AppConfig);

    // Inject adapter instance into IoC before bootstrap
    await app.bootstrap();
    const ioc = app.getContainer();

    // Prepare lifecycle hooks
    const order: string[] = [];
    ioc.get(TOKENS.OnStart).push(async () => {
      order.push('start:1');
    });
    ioc.get(TOKENS.OnStart).push(async () => {
      order.push('start:2');
    });
    ioc.get(TOKENS.OnShutdown).push(async () => {
      order.push('stop:1');
    });
    ioc.get(TOKENS.OnShutdown).push(async () => {
      order.push('stop:2');
    });

    const userReady = vi.fn(() => {
      order.push('user:ready');
    });

    // Start
    const running = app.listen(0, userReady);

    // Give the onReady chain time to finish:
    // Promise.then(runHooks[awaits]) -> next tick -> user callback.
    await new Promise(r => setTimeout(r, 0));

    // Expectations after listen(): OnStart hooks must be before user cb
    expect(listenSpy).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['start:1', 'start:2', 'user:ready']);

    // Close (graceful)
    await running.close();

    // Adapter closed once, and shutdown hooks fired in reverse order
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['start:1', 'start:2', 'user:ready', 'stop:2', 'stop:1']);
  });
});
