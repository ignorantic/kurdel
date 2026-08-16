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

User listings support status and text filters, stable sorting, and offset
pagination. `DatabaseUserService` also provides transactional bulk status,
role, and deletion operations; role lifecycle management with usage counts;
and dashboard statistics for users, credentials, and recent authentication
failures. `DatabaseAuthEventStore.listPage()` exposes global or per-user audit
history with type, date range, and offset filters while the existing `list()`
method remains available for simple queries.

Applications may also model authorization as roles containing permissions.
`DatabaseUserService.listPermissions()` exposes the application-owned catalog,
and `setRolePermissions()` replaces a role's assignments transactionally.
`DatabaseAuthUserRepository` resolves the union of permissions from every
current role into `AuthUser.permissions`. The application schema must provide
`permissions` and `role_permissions` tables; the runnable sample contains the
corresponding migration and seed data.

`DatabaseApiKeyUsageRecorder` updates `last_used_at` after successful
authentication. `AuthDatabaseModule` exposes it through
`AUTH_TOKENS.ApiKeyUsageRecorder`, ready to pass to `ApiKeyStrategy` as its
`usage` option.

Database audit persistence is opt-in because applications own their schema:

```ts
new AuthDatabaseModule({ audit: true });
```

This registers `DatabaseAuthEventStore` as `AUTH_DB_TOKENS.EventStore` and
wires API-key issue and revoke events into the management service. Pass the
same store to `AuthModule.events` to persist runtime authentication and
authorization events. The application must provide the configured
`auth_events` table; the runnable sample includes a migration with the expected
columns and indexes.

API-key issue or revocation and its database audit event run in the same
`IDatabase.transaction` callback. If audit persistence fails, the credential
mutation is rolled back and the service returns the original error. User
creation, role replacement, profile updates, and deletion use the same
transaction API for their multi-statement operations.

```ts
import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';
import { AuthDatabaseModule } from '@kurdel/auth-db';

const modules = [
  new AuthDatabaseModule(),
  new AuthModule({
    strategies: [
      {
        name: 'api-key',
        useFactory: ioc =>
          new ApiKeyStrategy({
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
When audit persistence is enabled, the default event table is `auth_events`;
it can be changed through `tables.authEvents`.

See the [`@kurdel/auth` documentation](../auth/README.md) for route protection,
authentication context, and custom strategy contracts.

## License

MIT © Andrii Sorokin
