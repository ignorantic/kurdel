import type { OnStartHook, OnShutdownHook } from '@kurdel/core/app';

/**
 * Executes lifecycle hooks in sequence with error handling and optional logging.
 *
 * Used by the runtime to manage application startup and shutdown phases.
 *
 * Design goals:
 * - Run hooks sequentially (not in parallel) to preserve dependency order.
 * - Stop execution immediately on first error (fail fast).
 * - Log hook errors if a logger is provided, but never swallow them silently.
 */
export class LifecycleManager {
  constructor(private readonly logger?: { error?: (...args: any[]) => void }) {}

  /**
   * Run all registered lifecycle hooks of a given kind.
   *
   * @param kind - Indicates whether start or shutdown hooks are being executed.
   * @param hooks - Ordered list of async or sync hooks to run.
   *
   * If any hook throws, execution stops and the error is rethrown after logging.
   */
  async runHooks(
    kind: 'start' | 'shutdown',
    hooks: Array<OnStartHook | OnShutdownHook>
  ): Promise<void> {
    for (const hook of hooks) {
      try {
        await hook();
      } catch (err) {
        try {
          this.logger?.error?.(`[lifecycle:${kind}]`, err);
        } catch {
          /* ignore logging errors */
        }
        throw err;
      }
    }
  }
}
