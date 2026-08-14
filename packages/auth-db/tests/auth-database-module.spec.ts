import { AUTH_TOKENS } from '@kurdel/auth';

import {
  AUTH_DB_TOKENS,
  AuthDatabaseModule,
  type ApiKeyHasher,
} from '../src/index.js';

describe('AuthDatabaseModule', () => {
  it('exports user, credential and hasher providers', () => {
    const hasher: ApiKeyHasher = { hash: key => `hashed:${key}` };
    const module = new AuthDatabaseModule({ apiKeyHasher: hasher });

    expect(module.providers).toHaveLength(3);
    expect(module.providers).toEqual(expect.arrayContaining([
      expect.objectContaining({ provide: AUTH_DB_TOKENS.ApiKeyHasher, useInstance: hasher }),
      expect.objectContaining({ provide: AUTH_TOKENS.UserRepository, singleton: true }),
      expect.objectContaining({ provide: AUTH_TOKENS.ApiKeyRepository, singleton: true }),
    ]));
    expect(module.exports).toEqual({
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
    });
  });
});
