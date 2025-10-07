# kurdel

A tiny **TypeScript-first** web framework built on SOLID + IoC.
Clear boundaries, **no decorators**, explicit modules & providers, typed results, and **request-scoped DI**.

* **API vs Runtime vs Facade** — public **contracts** live in `api/`, implementations in `runtime/`, and a few entry points in `facade/`.
* **IoC by contract** — depends on `@kurdel/ioc` interfaces; the default container lives in `@kurdel/ioc`.
* **No decorators** — routes and middleware are declared explicitly via small helpers (no magic).
* **Request scope** — the HTTP adapter creates a **per-request scope** and the router resolves controllers from it (no hidden globals).
* **Testable by design** — `Application.listen()` returns a *RunningServer* handle (`close()`, `raw()`).

---

## Install

```bash
npm i @kurdel/core @kurdel/ioc
````

> Node ≥ 18, TypeScript ≥ 5. ESM (`"type": "module"`) + TS `module: "nodenext"` recommended.

---

## Quick start

```ts
// app.ts
import { createApplication } from '@kurdel/core';
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

// 1) Controller: explicit routes via route(...) helper (no decorators)
class HelloController extends Controller {
  readonly routes = {
    hello: route({ method: 'GET', path: '/hello' })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({ message: 'Hello, kurdel!' });
  }
}

// 2) Feature module: declare controllers/middlewares/models explicitly
class HelloModule {
  readonly controllers = [{ use: HelloController }]; // ControllerConfig[]
  readonly middlewares = [];                          // optional global middlewares
  readonly models = [];                               // optional models/db

  // Optional hook:
  // async register(ioc, config) { ... }
}

// 3) Bootstrap
const app = await createApplication({ modules: [new HelloModule()] });
const server = app.listen(3000, () => console.log('http://localhost:3000'));
```

---

## Concepts

### Application (API)

A small façade exposing what you need:

* `use(...modules)` – add modules before startup.
* `listen(port)` → `RunningServer` – `{ address?, close(), raw?() }`.

### Modules

Encapsulate feature declarations:

```ts
import type { AppModule } from '@kurdel/core/app';
import type { ControllerConfig } from '@kurdel/core/http';

export class UserModule implements AppModule {
  readonly controllers: ControllerConfig[] = [
    { use: UserController, prefix: '/api' },
  ];
  readonly middlewares = [];
  readonly models = [];

  // Optional: async register(ioc, config) { /* custom wiring */ }
}
```

### Controllers (no decorators)

Base class + **whitelist of routes** using the `route(...)` helper that writes metadata under a shared `Symbol.for(...)`.

```ts
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

export class UserController extends Controller {
  readonly routes = {
    list:   route({ method: 'GET',    path: '/users'     })(this.list),
    byId:   route({ method: 'GET',    path: '/users/:id' })(this.byId),
    create: route({ method: 'POST',   path: '/users'     })(this.create),
  };

  async list(_ctx: HttpContext) { return Ok([{ id: 1, name: 'Ada' }]); }
  async byId(ctx: HttpContext)  { return Ok({ id: ctx.params.id }); }
  async create(ctx: HttpContext<{},{ name: string }>) {
    return Ok({ id: 'new', name: ctx.body?.name ?? 'unknown' });
  }
}
```

### Results & errors

Return structured **ActionResult** or throw **HttpError**. Helpers keep code concise:

```ts
import { Ok, NotFound } from '@kurdel/core/http';

if (!user) throw NotFound('User not found');
return Ok(user);
```

---

## Request-scoped DI (IoC)

kurdel relies on `@kurdel/ioc` and **resolves controllers from a per-request scope**:

* The HTTP adapter creates `scope = container.createScope?.() ?? container` **per request**.
* The router matches a route and resolves the controller **from that scope** (no `req.__ioc`, no globals).
* You can still pass static `deps` to controllers, or access the scope from middleware if needed.

Typed tokens are supported:

```ts
import { createToken } from '@kurdel/ioc';
const UserRepoToken = createToken<UserRepo>('users/UserRepo');

// container.bind(UserRepoToken).to(UserRepoImpl).inSingletonScope();
```

Framework tokens (e.g. `Router`, `ServerAdapter`, `ControllerResolver`, …) are available under `TOKENS.*`.

---

## Testing

`listen()` returns a handle that works well with `supertest`:

```ts
import request from 'supertest';
import { createApplication } from '@kurdel/core';
import { Controller, route, Ok } from '@kurdel/core/http';

class TController extends Controller {
  readonly routes = { ping: route({ method: 'GET', path: '/ping' })(this.ping) };
  async ping() { return Ok({ ok: true }); }
}

class TModule { readonly controllers = [{ use: TController }]; }

const app = await createApplication({ modules: [new TModule()] });
const h = app.listen(0);

const res = await request(h.raw()!).get('/ping');
expect(res.status).toBe(200);
expect(res.body).toEqual({ ok: true });

await h.close();
```

---

## Project layout (internal)

```
src/
  api/       # public contracts (types, tokens, base classes, helpers)
  runtime/   # implementations (router, middlewares, adapters, modules)
  facade/    # public entry points (e.g., createApplication)
  index.ts   # public root barrel (re-exports)
```

Consumers import from package subpaths:

```ts
import { createApplication } from '@kurdel/core';
import { Controller, route, Ok } from '@kurdel/core/http';
import type { AppModule } from '@kurdel/core/app';
```

---

## Status

Early-stage, evolving API. Feedback & PRs are welcome.
Roadmap: richer `HttpContext` helpers, in-memory HTTP adapter for tests, route param constraints, lifecycle hooks, graceful shutdown.

