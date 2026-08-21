# @kurdel/auth

Storage-agnostic authentication strategies and authorization middleware for
Kurdel applications.

The package authenticates incoming requests, resolves the current application
user, and exposes the result through `HttpContext`. Persistence is supplied by
the application or by adapters such as `@kurdel/auth-db`.

## Installation

```bash
npm install @kurdel/auth
```

## Configure authentication

Register one or more named strategies with `AuthModule`. Built-in provider
helpers resolve their framework dependencies from the application container:

```ts
import { apiKeyStrategy, AuthModule, jwtStrategy } from '@kurdel/auth';

const auth = new AuthModule({
  strategies: [apiKeyStrategy({ usage: true }), jwtStrategy({ sessions: true })],
});
```

This example assumes the application container already provides `JwtService`,
the user and credential repositories, `JwtSessionRepository`, and
`ApiKeyUsageRecorder`. `AuthDatabaseModule` supplies the repository-backed
dependencies; applications using `@kurdel/auth` alone must register their own
implementations. Omit `sessions` or `usage` when those optional services are
not needed.

`AuthModule` registers the authentication middleware automatically. Strategy
names are referenced by route metadata. `apiKeyStrategy()` uses `x-api-key` by
default; `usage: true` resolves the registered usage recorder. `jwtStrategy()`
uses the standard Bearer header; `sessions: true` resolves the registered JWT
session repository. Both options also accept explicit repository instances for
custom integrations. Applications can still register custom names and manual
strategy instances or factories through `AuthStrategyProvider`.

## Protect routes

Set `auth.strategy` to require authentication. Add `roles` when at least one of
the listed roles is required:

```ts
import { Controller, Ok, route, type HttpContext } from '@kurdel/core/http';

export class AccountController extends Controller {
  readonly routes = {
    profile: route({
      method: 'GET',
      path: '/profile',
      auth: { strategy: 'api-key' },
    })(this.profile),
    admin: route({
      method: 'GET',
      path: '/admin',
      auth: { strategy: 'api-key', roles: ['admin'] },
    })(this.admin),
    health: route({
      method: 'GET',
      path: '/health',
      auth: { public: true },
    })(this.health),
  };

  async profile(ctx: HttpContext) {
    return Ok({ user: ctx.auth?.user });
  }

  async admin(ctx: HttpContext) {
    return Ok({ authenticatedWith: ctx.auth?.strategy });
  }

  async health() {
    return Ok({ status: 'up' });
  }
}
```

Controller-level authentication can define defaults for every route. Route
metadata may override those defaults, and `{ public: true }` makes an
individual route public.

Authentication failures return `401 Unauthorized`. An authenticated user who
does not have any required role receives `403 Forbidden`. Referencing an
unregistered strategy is treated as an application configuration error and
returns `500 Internal Server Error`.

## Authorization policies

Named policies handle application-specific access rules that cannot be
expressed by roles alone. Register them alongside strategies:

```ts
const auth = new AuthModule({
  strategies: [
    /* ... */
  ],
  policies: [
    {
      name: 'manage-users',
      use: {
        authorize: (auth, ctx) =>
          auth.credential?.type === 'api-key' &&
          auth.user.roles.includes('admin') &&
          ctx.req.method !== 'TRACE',
      },
    },
  ],
});
```

Reference policies from route metadata:

```ts
route({
  method: 'POST',
  path: '/users',
  auth: {
    strategy: 'api-key',
    policies: ['manage-users'],
  },
})(this.createUser);
```

A policy receives the complete `AuthContext` and current `HttpContext`, and may
return a boolean, an `AuthorizationDecision`, or a promise. Decisions can carry
a safe reason code that is included in authorization-denied events. When
several policies are listed, every policy must grant access. Policies and
`roles` may be combined; both checks must then succeed. A rejected policy
returns `403 Forbidden`, while an unknown policy is reported as an application
configuration error.

Policy providers also support `useFactory`, allowing policies to resolve
application services from the dependency container.

For role-permission models, strategies may resolve `AuthUser.permissions` and
policies can use the built-in helpers:

```ts
import { allOf, anyOf, permissionPolicy } from '@kurdel/auth';

const apiKeyOnly = {
  authorize: auth => auth.credential?.type === 'api-key'
    ? { allowed: true }
    : { allowed: false, reason: 'api-key-required' },
};
const ownsRequestedUser = {
  authorize: (auth, ctx) => String(auth.user.id) === ctx.params.id
    ? { allowed: true }
    : { allowed: false, reason: 'self-access-required' },
};

const manageUsers = allOf(apiKeyOnly, permissionPolicy('users.manage'));
const viewUser = anyOf(permissionPolicy('users.view.any'), ownsRequestedUser);
```

Permissions express reusable capabilities, while policies remain executable
rules that may also inspect the request, credential, or target resource.
`allOf`, `anyOf`, and `not` compose policies and short-circuit evaluation while
preserving a nested denial reason for diagnostics. Boolean policies remain
fully supported.

## Security events

Configure an event sink to observe sanitized authentication and authorization
activity:

```ts
new AuthModule({
  events: {
    useFactory: ioc => ioc.get(APP_TOKENS.AuthEventSink),
  },
  strategies: [
    /* ... */
  ],
});
```

The package reports successful and failed authentication plus authorization
denials. API-key management services may additionally report credential issue
and revocation events. Events contain timestamps, strategy names, user and
credential identifiers, safe reason codes, policy names, and optional policy
decision reasons. Raw API keys,
JWTs, credential hashes, headers, and request bodies are never part of the
event contract.

Without configuration, `AuthModule` uses `NoopAuthEventSink`. Applications may
provide an instance or a factory-backed sink. Sink failures are propagated so
operators can choose an appropriate durable or failure-tolerant implementation
instead of having audit loss silently hidden by the framework.

## Authentication context

After successful authentication, middleware attaches an `AuthContext` to
`ctx.auth`:

```ts
interface AuthContext {
  user: AuthUser;
  strategy: string;
  credential?: {
    type: string;
    id?: string;
  };
  claims?: Record<string, unknown>;
}
```

- `user` is the current application identity, its current roles, and optional
  resolved permissions.
- `strategy` is the registered name selected by route metadata.
- `credential` identifies the credential kind and, when available, its stable
  identifier. It never contains the raw API key or JWT.
- `claims` contains verified strategy-specific claims, such as a JWT payload.

`ctx.user` remains available as an alias of `ctx.auth.user` for compatibility.
New code that needs authentication metadata should use `ctx.auth`.

The built-in API-key strategy exposes `credential.type` as `api-key` and uses
the repository credential ID when one exists. The JWT strategy exposes
`credential.type` as `jwt`, uses the `jti` claim as its optional ID, and places
the verified payload in `claims`.

To make JWTs revocable before their cryptographic expiration, enable a
registered `JwtSessionRepository`. Session-backed JWTs must contain a `jti`;
authentication then verifies that the referenced session exists, belongs to
the token subject, has not been revoked, and has not expired:

```ts
jwtStrategy({ sessions: true });
```

An explicit repository instance may be supplied instead of `true`. Without
`sessions`, JWT verification remains stateless and backward compatible.
Database-backed applications can pair short-lived access JWTs with rotating
opaque refresh tokens through `DatabaseJwtSessionService` from
`@kurdel/auth-db`. Refresh tokens are not JWTs and should never be placed in
authorization headers or persisted in plaintext by an application.

## User and credential repositories

Authentication strategies do not own user data. Both built-in strategies load
the current identity from `AuthUserRepository`, making the repository the
source of truth for current roles and disabled users:

```ts
interface AuthUserRepository {
  findById(id: string | number): Promise<AuthUser | null>;
}
```

`ApiKeyStrategy` additionally requires an `ApiKeyRepository`. Its
implementation must return `null` for unknown credentials and describe known
credentials without returning their raw secret. Revoked and expired API keys
are rejected before the user is authenticated.

Applications may provide an `ApiKeyUsageRecorder` to capture successful use of
credentials with stable IDs. The strategy records usage only after the key is
accepted and its current user is resolved; rejected, expired, revoked, and
orphaned credentials are never recorded.

Password login is composed from `PasswordAuthenticationService`, a
`PasswordCredentialRepository`, and a `PasswordHasher`. The built-in
`ScryptPasswordHasher` stores a random salt and its work parameters in a
self-describing encoded value. The service returns the current `AuthUser` only
after both the password and user state have been verified; unknown logins and
invalid passwords both return `null`.

For database-backed implementations, use `@kurdel/auth-db`. Applications may
also implement these interfaces for another database, an external identity
service, or an in-memory test setup.

## Custom strategies

Implement `AuthStrategy` to support another authentication mechanism:

```ts
import type { AuthStrategy, AuthenticationResult } from '@kurdel/auth';
import type { HttpRequest } from '@kurdel/common';

class SessionStrategy implements AuthStrategy {
  async authenticate(req: HttpRequest): Promise<AuthenticationResult | null> {
    const session = await loadSession(req);
    if (!session) return null;

    return {
      user: session.user,
      credential: { type: 'session', id: session.id },
    };
  }
}
```

A strategy returns `null` when the request cannot be authenticated. On
success, it returns the user and optional safe credential metadata or verified
claims. The middleware adds the registered strategy name to the final context.

## Database integration

See [`@kurdel/auth-db`](../auth-db/README.md) for reusable database repository
adapters and [`sample/auth-db`](../../sample/auth-db/README.md) for a runnable
SQLite application with API-key authentication and a React administration UI.

## License

MIT © Andrii Sorokin
