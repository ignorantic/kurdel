/** Controls repeated password authentication attempts for a login identifier. */
export interface PasswordAuthenticationProtection {
  assertAllowed(login: string): Promise<void> | void;
  recordFailure(login: string): Promise<void> | void;
  recordSuccess(login: string): Promise<void> | void;
}

/** Raised when password authentication is temporarily rate limited. */
export class PasswordAuthenticationBlockedError extends Error {
  constructor(readonly retryAt: Date) {
    super('Password authentication is temporarily blocked');
  }
}
