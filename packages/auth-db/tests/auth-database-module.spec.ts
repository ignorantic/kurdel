import { AUTH_TOKENS } from '@kurdel/auth';

import { AUTH_DB_TOKENS, AuthDatabaseModule, type ApiKeyHasher } from '../src/index.js';

describe('AuthDatabaseModule', () => {
  it('exports authentication repositories and management services', () => {
    const hasher: ApiKeyHasher = { hash: key => `hashed:${key}` };
    const module = new AuthDatabaseModule({ apiKeyHasher: hasher });

    expect(module.providers).toHaveLength(8);
    expect(module.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: AUTH_DB_TOKENS.ApiKeyHasher, useInstance: hasher }),
        expect.objectContaining({ provide: AUTH_TOKENS.UserRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.ApiKeyRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.ApiKeyUsageRecorder, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.JwtSessionRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.UserService, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.ApiKeyService, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.JwtSessionService, singleton: true }),
      ])
    );
    expect(module.exports).toEqual({
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyUsageRecorder: AUTH_TOKENS.ApiKeyUsageRecorder,
      jwtSessionRepository: AUTH_TOKENS.JwtSessionRepository,
      apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
      userService: AUTH_DB_TOKENS.UserService,
      apiKeyService: AUTH_DB_TOKENS.ApiKeyService,
      jwtSessionService: AUTH_DB_TOKENS.JwtSessionService,
    });
  });

  it('registers the database event store only when audit persistence is enabled', () => {
    const disabled = new AuthDatabaseModule();
    const enabled = new AuthDatabaseModule({ audit: true });

    expect(disabled.providers).toHaveLength(8);
    expect(disabled.exports).not.toHaveProperty('eventStore');
    expect(enabled.providers).toHaveLength(9);
    expect(enabled.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: AUTH_DB_TOKENS.EventStore, singleton: true }),
      ])
    );
    expect(enabled.exports).toHaveProperty('eventStore', AUTH_DB_TOKENS.EventStore);
  });
});
