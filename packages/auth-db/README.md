# @kurdel/auth-db

Database-backed repository adapters for `@kurdel/auth`.

The package keeps authentication strategies storage-agnostic while providing
standard implementations over Kurdel's `IDatabase` contract.

`DatabaseAuthUserRepository` resolves the current user and roles, while
`DatabaseApiKeyRepository` resolves safe credential metadata including its
stable ID. After a strategy succeeds, this data is available through
`ctx.auth.user` and `ctx.auth.credential`; raw API keys are never exposed in the
authentication context.

The package also provides `DatabaseUserService` and `DatabaseApiKeyService` for
administrative workflows. They create, list, update, and delete users, manage
role assignments, and issue, list, or revoke API keys. `AuthDatabaseModule`
registers both services as `AUTH_DB_TOKENS.UserService` and
`AUTH_DB_TOKENS.ApiKeyService`.

`DatabaseApiKeyUsageRecorder` updates `last_used_at` after successful
authentication. `AuthDatabaseModule` exposes it through
`AUTH_TOKENS.ApiKeyUsageRecorder`, ready to pass to `ApiKeyStrategy` as its
`usage` option.

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
          usage: ioc.get(AUTH_TOKENS.ApiKeyUsageRecorder),
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
The management services expect the profile and credential metadata columns
shown in those migrations, including user name, email, status and timestamps,
plus API-key name, status, expiration and last-use timestamps.

See the [`@kurdel/auth` documentation](../auth/README.md) for route protection,
authentication context, and custom strategy contracts.

## License

MIT © Andrii Sorokin
