import { env, EnvironmentValidationError, loadEnv } from '../src/index.js';

describe('environment configuration', () => {
  const schema = {
    PORT: env.number({ default: 3000, integer: true, min: 1, max: 65_535 }),
    ENABLE_AUDIT: env.boolean({ default: true }),
    NODE_ENV: env.enum(['development', 'test', 'production'], { default: 'development' }),
    API_SECRET: env.string({ minLength: 8 }),
    SENTRY_DSN: env.optional(env.string()),
  };

  it('parses typed values and applies defaults', () => {
    const environment = loadEnv(schema, {
      PORT: '8080',
      ENABLE_AUDIT: 'off',
      NODE_ENV: 'test',
      API_SECRET: '  secret-value  ',
    });
    expectTypeOf(environment.PORT).toEqualTypeOf<number>();
    expectTypeOf(environment.ENABLE_AUDIT).toEqualTypeOf<boolean>();
    expectTypeOf(environment.NODE_ENV)
      .toEqualTypeOf<'development' | 'test' | 'production'>();
    expectTypeOf(environment.SENTRY_DSN).toEqualTypeOf<string | undefined>();
    expect(environment).toEqual({
      PORT: 8080,
      ENABLE_AUDIT: false,
      NODE_ENV: 'test',
      API_SECRET: 'secret-value',
      SENTRY_DSN: undefined,
    });

    expect(loadEnv(schema, { API_SECRET: 'fallback-secret' })).toEqual({
      PORT: 3000,
      ENABLE_AUDIT: true,
      NODE_ENV: 'development',
      API_SECRET: 'fallback-secret',
      SENTRY_DSN: undefined,
    });
  });

  it('reports every issue without exposing rejected values', () => {
    const source = {
      PORT: '70000',
      ENABLE_AUDIT: 'sometimes',
      NODE_ENV: 'staging',
      API_SECRET: 'private',
    };

    expect(() => loadEnv(schema, source)).toThrow(EnvironmentValidationError);
    try {
      loadEnv(schema, source);
    } catch (error) {
      expect(error).toMatchObject({
        issues: [
          { key: 'PORT', message: 'must be less than or equal to 65535' },
          { key: 'ENABLE_AUDIT', message: 'must be a boolean' },
          { key: 'NODE_ENV', message: 'must be one of: development, test, production' },
          { key: 'API_SECRET', message: 'must contain at least 8 characters' },
        ],
      });
      expect(String(error)).not.toContain(source.API_SECRET);
    }
  });

  it('reports missing required values', () => {
    expect(() => loadEnv({ DATABASE_URL: env.string() }, {}))
      .toThrow('DATABASE_URL: is required');
  });
});
