/**
 * ## AuthUser
 *
 * Unified representation of an authenticated identity within the Kurdel runtime.
 *
 * Produced exclusively by authentication strategies.  
 * Used later by authorization middleware to determine access rights.
 *
 * Properties:
 * - `id` — public stable identity of the user (string or number).
 * - `roles` — zero or more logical roles (e.g., `"admin"`, `"user"`, `"system"`).
 * - Additional fields may be attached by strategies (JWT payload, profile data, etc.).
 *
 * @remarks
 * The runtime never interprets extra properties — they are passed through
 * transparently and may be used by controllers or custom middleware.
 */
export interface AuthUser {
  id: string | number;
  roles: string[];
  [key: string]: unknown;
}

/** Metadata about the credential used for the current authentication. */
export interface AuthCredential {
  type: string;
  id?: string;
}

/** Authentication state attached to a request after a strategy succeeds. */
export interface AuthContext<TUser extends AuthUser = AuthUser> {
  user: TUser;
  strategy: string;
  credential?: AuthCredential;
  claims?: Record<string, unknown>;
}
