import { describe, it, expect, vi } from 'vitest';
import { TOKENS } from '@kurdel/core/tokens';
import type { ServerAdapter } from '@kurdel/core/http';
import { RuntimeApplication } from 'src/app/runtime-application.js';
import { LifecycleModule } from 'src/modules/lifecycle-module.js';

/**
 * Verifies correct startup/shutdown hook ordering and adapter wiring.
 *
 * Expected flow:
 *   OnStart hooks → user onReady callback → OnShutdown hooks (reverse order)
 */
describe('Application lifecycle – order & wiring', () => {
  it('runs OnStart before user callback and OnShutdown in reverse after close()', async () => {
    const listenSpy = vi.fn<(port: number) => void>();
    const closeSpy = vi.fn<() => Promise<void>>().mockResolvedValue();

    class TestAdapter implements ServerAdapter {
      on = vi.fn();
      listen(port: number, hostOrCb?: string | (() => void), cb?: () => void) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => {});
        listenSpy(port);
        done(); // immediately signal "ready"
      }
      async close(): Promise<void> {
        await closeSpy();
      }
    }

    // Adapter provider module
    const AdapterModule = {
      providers: [
        {
          provide: TOKENS.ServerAdapter,
          useFactory: () => new TestAdapter(),
          singleton: true,
        },
      ],
    };

    // Construct the app with lifecycle + adapter modules
    const app = new RuntimeApplication({
      modules: [new LifecycleModule(), AdapterModule],
      db: false,
    });

    await app.bootstrap();
    const ioc = app.getContainer();

    // Lifecycle hooks setup
    const order: string[] = [];
    ioc.get(TOKENS.OnStart).push(async () => order.push('start:1'));
    ioc.get(TOKENS.OnStart).push(async () => order.push('start:2'));
    ioc.get(TOKENS.OnShutdown).push(async () => order.push('stop:1'));
    ioc.get(TOKENS.OnShutdown).push(async () => order.push('stop:2'));

    const userReady = vi.fn(() => order.push('user:ready'));

    // Start the app
    const running = app.listen(0, userReady);

    // Allow event loop to tick (simulate async callback scheduling)
    await new Promise(r => setTimeout(r, 0));

    // ✅ Verify startup sequence
    expect(listenSpy).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['start:1', 'start:2', 'user:ready']);

    // Graceful shutdown
    await running.close();

    // ✅ Verify shutdown sequence (reverse order)
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['start:1', 'start:2', 'user:ready', 'stop:2', 'stop:1']);
  });
});
