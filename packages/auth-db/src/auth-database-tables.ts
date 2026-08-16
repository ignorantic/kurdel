export interface AuthDatabaseTables {
  users: string;
  roles: string;
  userRoles: string;
  apiKeys: string;
  authEvents: string;
}

export const DEFAULT_AUTH_DATABASE_TABLES: Readonly<AuthDatabaseTables> = {
  users: 'users',
  roles: 'roles',
  userRoles: 'user_roles',
  apiKeys: 'api_keys',
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
