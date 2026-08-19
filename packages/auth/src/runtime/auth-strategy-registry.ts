import type { AuthStrategy } from 'src/domain/index.js';

/**
 * ## AuthStrategyRegistry
 *
 * Stores authentication strategies by name.
 *
 * Responsibilities:
 * - register authentication strategies during application startup
 * - resolve strategies by name during request processing
 * - allow strategies to be replaced or removed if required
 *
 * Guarantees:
 * - at most one strategy exists for a given name
 * - registering an existing name replaces the previous strategy
 *
 * Non-responsibilities:
 * - strategy execution
 * - authentication orchestration
 * - request handling
 */
export class AuthStrategyRegistry {
  private readonly strategies = new Map<string, AuthStrategy>();

  /**
   * Registers or replaces an authentication strategy.
   *
   * @param name Strategy identifier.
   * @param strategy Authentication strategy implementation.
   */
  register(name: string, strategy: AuthStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Returns the strategy registered under the specified name.
   *
   * @param name Strategy identifier.
   */
  get(name: string): AuthStrategy | undefined {
    return this.strategies.get(name);
  }
  
  /**
   * Removes the strategy associated with the specified name.
   *
   * @param name Strategy identifier.
   */
  unregister(name: string): void {
    this.strategies.delete(name);
  }
}
