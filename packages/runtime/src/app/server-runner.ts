import type { ServerAdapter, RunningServer } from '@kurdel/core/http';
import type { LifecycleManager } from 'src/app/lifecycle-manager.js';

/**
 * Orchestrates HTTP server startup and graceful shutdown.
 *
 * Responsibilities:
 * - Bridge between the framework runtime and the low-level ServerAdapter.
 * - Execute OnStart and OnShutdown lifecycle hooks in proper order.
 * - Wrap the raw server handle into a consistent RunningServer API.
 *
 * Design notes:
 * - ServerRunner is runtime-only; no Node.js types leak through public API.
 * - Hook execution order:
 *     - OnStart → forward order
 *     - OnShutdown → reverse order (LIFO)
 * - The per-request IoC scope is managed elsewhere (ServerModule).
 */
export class ServerRunner {
  constructor(
    private readonly adapter: ServerAdapter,
    private readonly lifecycle: LifecycleManager
  ) {}

  /**
   * Start the HTTP server and return a handle for runtime control.
   *
   * @param onStart - Hooks executed once the server signals readiness.
   * @param onShutdown - Hooks executed during graceful shutdown.
   * @param port - Port number to listen on.
   * @param hostOrCb - Optional hostname or callback function.
   * @param cb - Optional callback (if hostname was provided).
   *
   * Supports both call forms:
   *   - listen(port, callback)
   *   - listen(port, host, callback)
   */
  listen(
    onStart: (() => Promise<void>)[] = [],
    onShutdown: (() => Promise<void>)[] = [],
    port: number,
    hostOrCb?: string | (() => void),
    cb?: () => void
  ): RunningServer {
    // Normalize callback overloads
    const userCb = typeof hostOrCb === 'function' ? hostOrCb : cb;

    // Wrap user callback with lifecycle hook execution
    const onReady = async () => {
      await this.lifecycle.runHooks('start', onStart);
      userCb?.();
    };

    // Call adapter.listen with correct overload
    if (typeof hostOrCb === 'string') {
      this.adapter.listen?.(port, hostOrCb, onReady);
    } else {
      this.adapter.listen?.(port, onReady);
    }

    // Expose the running server handle
    return {
      /** Access the underlying server (if adapter exposes it) */
      raw: this.adapter.raw?.bind(this.adapter),

      /** Graceful shutdown: stop adapter, then run shutdown hooks (LIFO) */
      close: async () => {
        try {
          await Promise.resolve(this.adapter.close?.());
        } finally {
          await this.lifecycle.runHooks('shutdown', [...onShutdown].reverse());
        }
      },
    };
  }
}
