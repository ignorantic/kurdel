import type { HttpRequest } from '@kurdel/common';

import type { AuthenticationResult } from './auth-context.js';

/**
 * ## AuthStrategy
 *
 * A pluggable authentication mechanism.
 * Each strategy decides how to extract and validate credentials
 * from the incoming HTTP request.
 *
 * The strategy:
 *   - returns an AuthenticationResult on success
 *   - returns null if authentication fails
 *   - must NOT throw on invalid credentials
 */
export interface AuthStrategy {
  authenticate(req: HttpRequest): Promise<AuthenticationResult | null>;
}
