const UserRepository = Symbol('AuthUserRepository');

export const AUTH_TOKENS = {
  StrategyRegistry: Symbol('AuthStrategyRegistry'),
  PolicyRegistry: Symbol('AuthorizationPolicyRegistry'),
  EventSink: Symbol('AuthEventSink'),
  UserRepository,
  /** @deprecated Use UserRepository. */
  JwtRepository: UserRepository,
  ApiKeyRepository: Symbol('ApiKeyRepository'),
  ApiKeyUsageRecorder: Symbol('ApiKeyUsageRecorder'),
  JwtSessionRepository: Symbol('JwtSessionRepository'),
  PasswordCredentialRepository: Symbol('PasswordCredentialRepository'),
  PasswordAuthenticationProtection: Symbol('PasswordAuthenticationProtection'),
  PasswordAuthenticationService: Symbol('PasswordAuthenticationService'),
  JwtService: Symbol('JwtService'),
};
