const UserRepository = Symbol('AuthUserRepository');

export const AUTH_TOKENS = {
  StrategyRegistry: Symbol('AuthStrategyRegistry'),
  PolicyRegistry: Symbol('AuthorizationPolicyRegistry'),
  UserRepository,
  /** @deprecated Use UserRepository. */
  JwtRepository: UserRepository,
  ApiKeyRepository: Symbol('ApiKeyRepository'),
  JwtService: Symbol('JwtService'),
};
