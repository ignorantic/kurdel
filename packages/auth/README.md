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

Register one or more named strategies with `AuthModule`. A strategy instance
can be supplied directly or created from the application container:

```ts
import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';

const auth = new AuthModule({
  strategies: [
    {
      name: 'api-key',
      useFactory: ioc =>
        new ApiKeyStrategy({
          header: 'x-api-key',
          credentials: ioc.get(AUTH_TOKENS.ApiKeyRepository),
          users: ioc.get(AUTH_TOKENS.UserRepository),
        }),
    },
  ],
});
```

`AuthModule` registers the authentication middleware automatically. Strategy
names are application-defined and are referenced by route metadata.

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

- `user` is the current application identity and its current roles.
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
