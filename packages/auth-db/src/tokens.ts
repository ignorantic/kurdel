/**
 * ## AUTH_DB_TOKENS
 *
 * Dependency injection tokens exported by `@kurdel/auth-db`.
 *
 * These tokens identify infrastructure services provided by
 * `AuthDatabaseModule`.
 */
export const AUTH_DB_TOKENS = {
  ApiKeyHasher: Symbol('AuthDbApiKeyHasher'),
  UserService: Symbol('AuthDbUserService'),
  ApiKeyService: Symbol('AuthDbApiKeyService'),
  JwtSessionService: Symbol('AuthDbJwtSessionService'),
  PasswordHasher: Symbol('AuthDbPasswordHasher'),
  PasswordService: Symbol('AuthDbPasswordService'),
  EventStore: Symbol('AuthDbEventStore'),
};
