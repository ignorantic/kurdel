import type { AuthUser, HttpRequest } from '@kurdel/common';

/**
 * ## AuthStrategy
 *
 * A pluggable authentication mechanism.
 * Each strategy decides how to extract and validate credentials
 * from the incoming HTTP request.
 *
 * The strategy:
 *   - returns an AuthUser on success
 *   - returns null if authentication fails
 *   - must NOT throw on invalid credentials
 */
export interface AuthStrategy {
  authenticate(req: HttpRequest): Promise<AuthUser | null>;
}