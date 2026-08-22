import { AUTH_TOKENS } from '@kurdel/auth';
import { Database, type Database as DatabaseContract } from '@kurdel/db';
import { IoCContainer } from '@kurdel/ioc';

import {
  AUTH_DB_TOKENS,
  AuthDatabaseModule,
  DatabaseAuthEventStore,
  DatabasePasswordService,
  type ApiKeyHasher,
} from '../src/index.js';

describe('AuthDatabaseModule', () => {
  it('exports authentication repositories and management services', () => {
    const hasher: ApiKeyHasher = { hash: key => `hashed:${key}` };
    const module = new AuthDatabaseModule({ apiKeyHasher: hasher });

    expect(module.providers).toHaveLength(13);
    expect(module.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: AUTH_DB_TOKENS.ApiKeyHasher, useInstance: hasher }),
        expect.objectContaining({ provide: AUTH_TOKENS.UserRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.ApiKeyRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.ApiKeyUsageRecorder, singleton: true }),
        expect.objectContaining({ provide: AUTH_TOKENS.JwtSessionRepository, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.PasswordHasher }),
        expect.objectContaining({
          provide: AUTH_TOKENS.PasswordCredentialRepository,
          singleton: true,
        }),
        expect.objectContaining({
          provide: AUTH_TOKENS.PasswordAuthenticationService,
          singleton: true,
        }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.UserService, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.ApiKeyService, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.JwtSessionService, singleton: true }),
        expect.objectContaining({ provide: AUTH_DB_TOKENS.PasswordService, singleton: true }),
      ])
    );
    expect(module.exports).toEqual({
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyUsageRecorder: AUTH_TOKENS.ApiKeyUsageRecorder,
      jwtSessionRepository: AUTH_TOKENS.JwtSessionRepository,
      passwordCredentialRepository: AUTH_TOKENS.PasswordCredentialRepository,
      passwordAuthenticationService: AUTH_TOKENS.PasswordAuthenticationService,
      apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
      userService: AUTH_DB_TOKENS.UserService,
      apiKeyService: AUTH_DB_TOKENS.ApiKeyService,
      jwtSessionService: AUTH_DB_TOKENS.JwtSessionService,
      passwordService: AUTH_DB_TOKENS.PasswordService,
    });
  });

  it('registers the database event store only when audit persistence is enabled', () => {
    const disabled = new AuthDatabaseModule();
    const enabled = new AuthDatabaseModule({ audit: true });

    expect(disabled.providers).toHaveLength(13);
    expect(disabled.providers.every(provider => !('useFactory' in provider))).toBe(true);
    expect(disabled.exports).not.toHaveProperty('eventStore');
    expect(enabled.providers).toHaveLength(14);
    expect(enabled.providers.every(provider => !('useFactory' in provider))).toBe(true);
    expect(enabled.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: AUTH_DB_TOKENS.EventStore, singleton: true }),
      ])
    );
    expect(enabled.exports).toHaveProperty('eventStore', AUTH_DB_TOKENS.EventStore);
  });

  it('resolves class providers from their declared dependency graph', () => {
    const ioc = new IoCContainer();
    const database = {} as DatabaseContract;
    const module = new AuthDatabaseModule({ audit: true });
    ioc.bind(Database).toInstance(database);

    for (const provider of module.providers) {
      if ('useInstance' in provider) {
        ioc.bind(provider.provide).toInstance(provider.useInstance);
      } else if ('useClass' in provider) {
        const binding = ioc.bind(provider.provide).to(provider.useClass);
        if (provider.deps) binding.with(provider.deps);
        if (provider.singleton) binding.inSingletonScope();
      } else {
        throw new Error('AuthDatabaseModule should not contain factory providers');
      }
    }

    expect(ioc.get(AUTH_DB_TOKENS.PasswordService)).toBeInstanceOf(DatabasePasswordService);
    expect(ioc.get(AUTH_DB_TOKENS.EventStore)).toBeInstanceOf(DatabaseAuthEventStore);
    expect(ioc.get(AUTH_DB_TOKENS.PasswordService)).toBe(
      ioc.get(AUTH_DB_TOKENS.PasswordService)
    );
  });
});
