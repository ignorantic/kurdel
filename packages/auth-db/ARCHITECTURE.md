# @kurdel/auth-db Architecture

## Overview

`@kurdel/auth-db` provides database-backed infrastructure for
`@kurdel/auth`.

Authentication itself remains the responsibility of `@kurdel/auth`.
This package supplies persistent implementations of its contracts
using Kurdel's `Database` abstraction.

```
┌─────────────────────┐
│     @kurdel/auth    │
│                     │
│  Strategies         │
│  Contracts          │
│  Runtime middleware │
└──────────┬──────────┘
           │
           │ contracts
           ▼
┌─────────────────────┐
│   @kurdel/auth-db   │
│                     │
│  Repositories       │
│  Services           │
│  Audit              │
│  Database storage   │
└──────────┬──────────┘
           │
           ▼
      SQL Database
```

---

## Components

The package consists of four infrastructure categories.

### Repositories

Repositories resolve persisted authentication data.

Examples:

- `DatabaseAuthUserRepository`
- `DatabaseApiKeyRepository`
- `DatabaseJwtSessionRepository`
- `DatabasePasswordCredentialRepository`

Repositories never mutate application state.

Their responsibility is to resolve authentication information required
by strategies.

---

### Services

Services manage authentication-related entities.

Examples:

- `DatabaseUserService`
- `DatabaseApiKeyService`
- `DatabaseJwtSessionService`
- `DatabasePasswordService`

Services own business operations such as:

- creating users
- assigning roles
- issuing API keys
- revoking JWT sessions
- rotating refresh tokens
- changing passwords

Multi-step operations execute inside database transactions.

---

### Store

`DatabaseAuthEventStore`

Persists sanitized authentication audit events.

The store is optional and is enabled through:

```ts
new AuthDatabaseModule({
  audit: true,
});
```

---

### Recorder

`DatabaseApiKeyUsageRecorder`

Updates credential metadata after successful authentication.

This component is intentionally isolated from API-key management.

---

## Authentication flow

```
Request
    │
    ▼
AuthStrategy
    │
    ▼
Repository
    │
    ▼
AuthUser
    │
    ▼
HttpContext
    │
    ▼
Controller
```

Strategies authenticate requests.

Repositories resolve persistent state.

Runtime stores the resulting `AuthUser` inside the request context.

---

## JWT sessions

JWT access tokens remain cryptographically self-contained. When session
validation is enabled, authentication is stateful because every request also
checks the persisted session.

Server-side state is represented by a persisted session referenced by
the JWT `jti` claim.

```
JWT
 │
 │ jti
 ▼
jwt_sessions
```

Revoking a session invalidates every access token that references it.

Refresh tokens are stored independently.

Only their SHA-256 hashes are persisted.

Every successful refresh rotates the stored hash and returns a new
opaque refresh token.

---

## API keys

API keys are never stored in plaintext.

```
Client Key
      │
      ▼
 SHA-256
      │
      ▼
api_keys.key_hash
```

The original key is returned only once during creation.

Subsequent authentication resolves credentials by hash.

---

## Passwords

Passwords are stored separately from user profiles.

```
users
    │
    ▼
password_credentials
```

By default the package uses `ScryptPasswordHasher`.

Applications may replace it with any implementation of
`PasswordHasher`.

---

## Roles and permissions

Authorization is modeled as:

```
User
 │
 ▼
Roles
 │
 ▼
Permissions
```

`DatabaseAuthUserRepository` resolves the union of permissions from all
assigned roles.

Strategies do not evaluate permissions.

They simply resolve them into `AuthUser`.

---

## Database ownership

Applications own the database schema.

`@kurdel/auth-db` expects a compatible schema but never creates or
modifies database tables automatically.

See `sample/auth-db` for migrations and seed data.

---

## Design principles

- storage-agnostic authentication
- database-agnostic implementation
- explicit dependency injection
- transactional mutations
- immutable credential identifiers
- sanitized audit events
- no transport dependencies
