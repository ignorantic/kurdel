import type { AuthStrategy } from 'src/domain/index.js';

/**
 * ## AuthStrategyRegistry
 *
 * Holds named authentication strategies (e.g. `jwt`, `apikey`, `session`).
 * Strategies are resolved by middleware per request.
 */
export class AuthStrategyRegistry {
  private readonly strategies = new Map<string, AuthStrategy>();

  /**
   * Registers a new authentication strategy.
   *
   * @param name - Strategy identifier (e.g. "jwt", "apikey").
   * @param strategy - Implementation of {@link AuthStrategy}.
   */
  register(name: string, strategy: AuthStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Returns a strategy by name, if registered.
   */
  get(name: string): AuthStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Removes a strategy (rarely used).
   */
  unregister(name: string): void {
    this.strategies.delete(name);
  }
}
