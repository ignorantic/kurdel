import type { AuthorizationPolicy } from 'src/domain/index.js';

/** Stores the named authorization policies available to route metadata. */
export class AuthorizationPolicyRegistry {
  private readonly policies = new Map<string, AuthorizationPolicy>();

  register(name: string, policy: AuthorizationPolicy): void {
    this.policies.set(name, policy);
  }

  get(name: string): AuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  unregister(name: string): void {
    this.policies.delete(name);
  }
}
