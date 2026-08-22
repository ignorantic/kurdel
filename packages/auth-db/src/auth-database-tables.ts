/**
 * ## AuthDatabaseTables
 *
 * Names of all database tables used by `@kurdel/auth-db`.
 *
 * Applications may override these names to integrate with an
 * existing database schema.
 */
export interface AuthDatabaseTables {
  users: string;
  roles: string;
  userRoles: string;
  permissions: string;
  rolePermissions: string;
  apiKeys: string;
  jwtSessions: string;
  jwtRefreshTokens: string;
  passwordCredentials: string;
  passwordResetTokens: string;
  authEvents: string;
}

/**
 * Default table names used by `@kurdel/auth-db`.
 */
export const DEFAULT_AUTH_DATABASE_TABLES: Readonly<AuthDatabaseTables> = {
  users: 'users',
  roles: 'roles',
  userRoles: 'user_roles',
  permissions: 'permissions',
  rolePermissions: 'role_permissions',
  apiKeys: 'api_keys',
  jwtSessions: 'jwt_sessions',
  jwtRefreshTokens: 'jwt_refresh_tokens',
  passwordCredentials: 'password_credentials',
  passwordResetTokens: 'password_reset_tokens',
  authEvents: 'auth_events',
};

export class InvalidDatabaseTableNameError extends Error {
  constructor(readonly identifier: string) {
    super(`Invalid auth database table name '${identifier}'`);
  }
}

/**
 * Resolves the effective table mapping.
 *
 * User-provided table names override the defaults.
 *
 * All identifiers are validated to ensure they are safe for
 * interpolation into SQL statements.
 *
 * @throws Error If any table name is not a valid SQL identifier.
 */
export function resolveAuthDatabaseTables(
  tables: Partial<AuthDatabaseTables> = {}
): AuthDatabaseTables {
  const resolved = { ...DEFAULT_AUTH_DATABASE_TABLES, ...tables };
  Object.values(resolved).forEach(assertSqlIdentifier);
  return resolved;
}

/**
 * Ensures that a table name is a valid SQL identifier.
 *
 * SQL identifiers cannot be bound as query parameters.
 * Therefore every configured table name is validated before being
 * interpolated into SQL statements.
 */
function assertSqlIdentifier(identifier: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new InvalidDatabaseTableNameError(identifier);
  }
}
