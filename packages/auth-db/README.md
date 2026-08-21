# @kurdel/auth-db

Database-backed infrastructure for `@kurdel/auth`.

The package provides production-ready implementations of the repositories and
application services defined by `@kurdel/auth` on top of Kurdel's `Database`
abstraction. Authentication strategies remain storage-agnostic while
applications own their database schema and migrations.

## Features

- Database-backed authentication repositories
- User, role and permission management
- API key lifecycle management
- JWT session persistence and revocation
- Refresh token rotation
- Password credential storage
- Authentication audit persistence
- SQLite and PostgreSQL support

## Registered services

`AuthDatabaseModule` registers the following infrastructure:

| Token | Implementation |
|-------|----------------|
| `AUTH_TOKENS.UserRepository` | `DatabaseAuthUserRepository` |
| `AUTH_TOKENS.ApiKeyRepository` | `DatabaseApiKeyRepository` |
| `AUTH_TOKENS.JwtSessionRepository` | `DatabaseJwtSessionRepository` |
| `AUTH_TOKENS.PasswordCredentialRepository` | `DatabasePasswordCredentialRepository` |
| `AUTH_TOKENS.ApiKeyUsageRecorder` | `DatabaseApiKeyUsageRecorder` |
| `AUTH_TOKENS.PasswordAuthenticationService` | `PasswordAuthenticationService` |
| `AUTH_DB_TOKENS.UserService` | `DatabaseUserService` |
| `AUTH_DB_TOKENS.ApiKeyService` | `DatabaseApiKeyService` |
| `AUTH_DB_TOKENS.JwtSessionService` | `DatabaseJwtSessionService` |
| `AUTH_DB_TOKENS.PasswordService` | `DatabasePasswordService` |

When audit persistence is enabled, the module also registers:

| Token | Implementation |
|-------|----------------|
| `AUTH_DB_TOKENS.EventStore` | `DatabaseAuthEventStore` |

## Usage

```ts
import { apiKeyStrategy, AuthModule, jwtStrategy } from '@kurdel/auth';
import { AuthDatabaseModule, databaseAuthEventSink } from '@kurdel/auth-db';

const modules = [
  new AuthDatabaseModule({ audit: true }),

  new AuthModule({
    events: databaseAuthEventSink(),
    strategies: [apiKeyStrategy({ usage: true }), jwtStrategy({ sessions: true })],
  }),
];
```

`databaseAuthEventSink()` connects `AuthModule` to the event store registered by
`AuthDatabaseModule({ audit: true })` without exposing its internal DI token.

## User management

`DatabaseUserService` provides transactional user administration.

Features include:

- create, update and delete users
- paginated user listing
- bulk status updates
- bulk role assignment
- bulk deletion
- role lifecycle management
- permission assignment
- dashboard statistics

Applications may model authorization as roles containing permissions.
`DatabaseAuthUserRepository` resolves the union of permissions from all
assigned roles into `AuthUser.permissions`.

## API keys

`DatabaseApiKeyService` manages the complete lifecycle of API keys.

It supports:

- issuing new keys
- listing active keys
- revoking keys
- expiration
- usage tracking

Only SHA-256 hashes are persisted. Raw API keys are returned only during
creation and are never stored.

`DatabaseApiKeyUsageRecorder` automatically updates `last_used_at` after
successful authentication.

## JWT sessions

`DatabaseJwtSessionService` manages server-side JWT sessions referenced by the
JWT `jti` claim.

It provides:

- `create()`
- `createRefreshable()`
- `refresh()`
- `list()`
- `revoke()`
- `revokeAll()`

Refresh tokens are stored only as SHA-256 hashes and rotated atomically on
every successful refresh.

Applications are free to choose independent lifetimes for access tokens and
refresh tokens.

`DatabaseJwtSessionRepository` resolves persisted session metadata used by
`JwtStrategy` to detect revoked sessions.

## Password authentication

Passwords are stored separately from user profiles.

The package provides:

- `DatabasePasswordCredentialRepository`
- `DatabasePasswordService`
- `PasswordAuthenticationService`

`DatabasePasswordService` hashes and stores passwords using
`ScryptPasswordHasher` by default.

Applications may replace the hasher:

```ts
new AuthDatabaseModule({
  passwordHasher: customHasher,
});
```

## Authentication audit

Audit persistence is optional.

```ts
new AuthDatabaseModule({
  audit: true,
});
```

When enabled:

- `DatabaseAuthEventStore` is registered
- management services persist audit events
- the same store can be passed to `AuthModule.events`

Authentication events are stored in the application's `auth_events` table.

API key creation, revocation and audit persistence execute within the same
database transaction.

## Configuration

Applications may customize table names and hashing implementations.

```ts
new AuthDatabaseModule({
  tables: {
    users: 'application_users',
    apiKeys: 'application_api_keys',
  },

  apiKeyHasher: customApiKeyHasher,
  passwordHasher: customPasswordHasher,
});
```

## Database schema

By default the package expects the following tables:

- `users`
- `roles`
- `user_roles`
- `permissions`
- `role_permissions`
- `api_keys`
- `jwt_sessions`
- `jwt_refresh_tokens`
- `password_credentials`
- `auth_events`

Applications own the schema and migrations.

See `sample/auth-db` for a complete runnable example including migrations and
seed data.

## Architecture

`@kurdel/auth-db` is an infrastructure package.

Its responsibilities are:

- resolve persisted authentication data
- manage authentication-related entities
- persist authentication audit events
- integrate authentication with relational databases

It does **not** implement authentication strategies.

Authentication strategies remain part of `@kurdel/auth`, while this package
provides the storage layer they depend on.

See the [`@kurdel/auth` documentation](../auth/README.md) for route protection,
authentication middleware, and custom authentication strategies.

## License

MIT © Andrii Sorokin
