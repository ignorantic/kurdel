import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult } from './auth-context.js';

/**
 * ## AuthStrategy
 *
 * Contract implemented by every authentication strategy.
 *
 * A strategy is responsible for extracting credentials from an incoming
 * HTTP request, validating them, and resolving the authenticated
 * application identity.
 *
 * Guarantees:
 * - returns an {@link AuthenticationResult} after successful authentication
 * - returns `null` when authentication cannot be established
 * - does not throw for invalid or missing credentials
 *
 * Strategies remain independent of storage. User identities and
 * credential metadata are resolved through repository contracts.
 */
export interface AuthStrategy {
  /**
   * Attempts to authenticate the incoming request.
   *
   * Returns `null` when the request does not contain valid credentials.
   */
  authenticate(req: HttpRequest): Promise<AuthenticationResult | null>;
}