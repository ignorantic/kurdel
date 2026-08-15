# @kurdel/auth-db

Database-backed repository adapters for `@kurdel/auth`.

The package keeps authentication strategies storage-agnostic while providing
standard implementations over Kurdel's `IDatabase` contract.

`DatabaseAuthUserRepository` resolves the current user and roles, while
`DatabaseApiKeyRepository` resolves safe credential metadata including its
stable ID. After a strategy succeeds, this data is available through
`ctx.auth.user` and `ctx.auth.credential`; raw API keys are never exposed in the
authentication context.

```ts
import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';
import { AuthDatabaseModule } from '@kurdel/auth-db';

const modules = [
  new AuthDatabaseModule(),
  new AuthModule({
    strategies: [
      {
        name: 'api-key',
        useFactory: ioc => new ApiKeyStrategy({
          header: 'x-api-key',
          credentials: ioc.get(AUTH_TOKENS.ApiKeyRepository),
          users: ioc.get(AUTH_TOKENS.UserRepository),
        }),
      },
    ],
  }),
];
```

Custom table names and hashing implementations can be supplied through the
module configuration:

```ts
new AuthDatabaseModule({
  tables: {
    users: 'application_users',
    apiKeys: 'application_api_keys',
  },
  apiKeyHasher: customHasher,
});
```

By default, the package expects `users`, `roles`, `user_roles`, and `api_keys`
tables and uses SHA-256 for API-key lookup. Schema ownership remains with the
application; see `sample/auth-db` for migrations and a runnable example.

See the [`@kurdel/auth` documentation](../auth/README.md) for route protection,
authentication context, and custom strategy contracts.

## License

MIT © Andrii Sorokin
