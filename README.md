# kurdel

A tiny **TypeScript-first** web framework built on SOLID + IoC.
Clear boundaries, **no decorators**, explicit modules & providers, typed results, and **request-scoped DI**.

---

## 🧩 Architecture Overview

Kurdel is now split into **three packages**, each with a clear role:

| Package | Purpose |
|----------|----------|
| **`@kurdel/core`** | Framework **contracts**, types, and tokens — pure API definitions, no runtime code. |
| **`@kurdel/runtime`** | Actual **implementations** — router, controller resolver, adapters, modules, lifecycle, etc. |
| **`@kurdel/facade`** | The **entry point** for applications — exports `createApplication()` and hides internal structure. |

This separation allows users to depend only on stable APIs (`@kurdel/core`), while internal logic lives in `@kurdel/runtime`.

---

## ✨ Features

* **IoC by contract** — built on `@kurdel/ioc`, compatible with any IoC container.
* **No decorators** — routes and middlewares are explicit (no reflection or metadata).
* **Request scope** — controllers are resolved from a **per-request DI scope**.
* **Lifecycle hooks** — modules can register startup/shutdown hooks.
* **Typed routes** — compile-time validation for route parameters.
* **Testable by design** — `Application.listen()` returns a typed `RunningServer` with `close()` and `raw()`.

---

## ⚙️ Installation

```bash
npm i @kurdel/facade @kurdel/runtime @kurdel/core @kurdel/ioc
```

> Node ≥ 18, TypeScript ≥ 5.
> Recommended: `"type": "module"`, `"module": "nodenext"` in `tsconfig.json`.

---

## 🚀 Quick start

```ts
// app.ts
import { createApplication } from '@kurdel/facade';
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

// 1) Controller: explicit routes via the route() helper
class HelloController extends Controller {
  readonly routes = {
    hello: route({ method: 'GET', path: '/hello' })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({ message: 'Hello, kurdel!' });
  }
}

// 2) Feature module
class HelloModule {
  readonly controllers = [{ use: HelloController }];
}

// 3) Bootstrap
const app = await createApplication({ modules: [new HelloModule()] });
const server = app.listen(3000, () => console.log('http://localhost:3000'));
```

---

## 🧠 Concepts

### Application (from `@kurdel/runtime`)

Encapsulates module registration and server startup.

```ts
import type { Application } from '@kurdel/core/app';
```

Main API:

* `use(...modules)` – add additional modules before bootstrap.
* `listen(port)` → returns `RunningServer` — `{ raw?(), close() }`.

### Modules

Encapsulate feature logic (controllers, middlewares, models, lifecycle hooks):

```ts
import type { AppModule } from '@kurdel/core/app';
import type { ControllerConfig } from '@kurdel/core/http';

export class UserModule implements AppModule {
  readonly controllers: ControllerConfig[] = [
    { use: UserController, prefix: '/api' },
  ];

  // optional lifecycle hook
  async register(ioc, config) {
    // custom wiring here
  }
}
```

### Controllers (no decorators)

Controllers declare routes using the `route()` helper.

```ts
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

export class UserController extends Controller {
  readonly routes = {
    list:   route({ method: 'GET',  path: '/users'     })(this.list),
    byId:   route({ method: 'GET',  path: '/users/:id' })(this.byId),
    create: route({ method: 'POST', path: '/users'     })(this.create),
  };

  async list() { return Ok([{ id: 1, name: 'Ada' }]); }
  async byId(ctx: HttpContext<{}, {}, { id: string }>) {
    return Ok({ id: ctx.params.id });
  }
  async create(ctx: HttpContext<{}, { name: string }>) {
    return Ok({ id: 'new', name: ctx.body?.name ?? 'unknown' });
  }
}
```

---

## 🔁 Request-scoped IoC

Kurdel uses dependency injection from `@kurdel/ioc` under the hood.
Each request creates a **child container scope**, isolating controller instances.

```ts
import { createToken } from '@kurdel/ioc';
const UserRepoToken = createToken<UserRepo>('users/UserRepo');

// container.bind(UserRepoToken).to(UserRepoImpl).inSingletonScope();
```

Framework-level tokens like `Router`, `ServerAdapter`, `ControllerResolver`, etc. are available via `TOKENS.*`.

---

## 🧩 Lifecycle Hooks

Modules can define lifecycle callbacks that run automatically:

```ts
import type { OnStartHook, OnShutdownHook } from '@kurdel/core/app/lifecycle';

class MetricsModule {
  readonly onStart: OnStartHook[] = [() => console.log('Started!')];
  readonly onShutdown: OnShutdownHook[] = [() => console.log('Stopped!')];
}
```

* `onStart` hooks run **before** the user `listen()` callback.
* `onShutdown` hooks run **after** `server.close()` in reverse order.

---

## 🧪 Testing

`listen()` returns a handle that integrates with `supertest`:

```ts
import request from 'supertest';
import { createApplication } from '@kurdel/facade';
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

## 📁 Project layout (monorepo)

```
packages/
  core/      # Pure contracts (API types, interfaces, tokens)
  runtime/   # Implementations (router, modules, adapters, lifecycle)
  facade/    # Entry points (createApplication, CLI, helpers)
  ioc/       # IoC container library used internally and externally
```

Consumers import from subpaths, e.g.:

```ts
import { createApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';
import type { AppModule } from '@kurdel/core/app';
```
---

## 🧩 Development & Contribution

If you’re interested in how **kurdel** is structured or want to contribute:

- 🏗️ [Architecture overview](./ARCHITECTURE.md) — explains the internal layers (`core`, `runtime`, `facade`) and naming conventions.
- 🧑‍💻 [Contributing guide](./CONTRIBUTING.md) — details on development workflow, build setup, commit format, and testing.

Both documents are meant for **contributors and maintainers**,  
not for everyday users of the framework.

---

## 🚧 Status

Early-stage and evolving API — feedback is welcome.
Next steps:

* In-memory HTTP adapter for tests
* Route param constraints
* Extended `HttpContext` utilities
* CLI scaffolding

---

© Andrii Sorokin · MIT License