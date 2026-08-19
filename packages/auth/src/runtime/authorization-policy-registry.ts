import type { AuthorizationPolicy } from 'src/domain/index.js';

/**
 * ## AuthorizationPolicyRegistry
 *
 * Stores authorization policies by name.
 *
 * Responsibilities:
 * - register authorization policies during application startup
 * - resolve policies by name during request processing
 * - allow policies to be replaced or removed if required
 *
 * Guarantees:
 * - at most one policy exists for a given name
 * - registering an existing name replaces the previous policy
 *
 * Non-responsibilities:
 * - policy evaluation
 * - authentication
 * - request handling
 */
export class AuthorizationPolicyRegistry {
  private readonly policies = new Map<string, AuthorizationPolicy>();

  /**
   * Registers or replaces an authorization policy.
   *
   * @param name Policy identifier.
   * @param policy Authorization policy implementation.
   */
  register(name: string, policy: AuthorizationPolicy): void {
    this.policies.set(name, policy);
  }

  /**
   * Returns the policy registered under the specified name.
   *
   * @param name Policy identifier.
   */
  get(name: string): AuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  /**
   * Removes the policy associated with the specified name.
   *
   * @param name Policy identifier.
   */
  unregister(name: string): void {
    this.policies.delete(name);
  }
}
