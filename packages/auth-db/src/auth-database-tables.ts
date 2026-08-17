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
  authEvents: string;
}

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
  authEvents: 'auth_events',
};

export function resolveAuthDatabaseTables(
  tables: Partial<AuthDatabaseTables> = {}
): AuthDatabaseTables {
  const resolved = { ...DEFAULT_AUTH_DATABASE_TABLES, ...tables };
  Object.values(resolved).forEach(assertSqlIdentifier);
  return resolved;
}

function assertSqlIdentifier(identifier: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid auth database table name '${identifier}'`);
  }
}
