# kurdel

A tiny **TypeScript-first** web framework built on SOLID + IoC.
Clear boundaries, **no decorators**, explicit modules & providers, typed results, and **request-scoped DI**.

---

## 🧩 Architecture Overview

Kurdel is organized as a modular monorepo with clearly separated packages —  
each focused on a single responsibility and layered for stability.

| Package | Purpose |
|----------|----------|
| **`@kurdel/common`** | Shared low-level primitives: HTTP types, helpers, and base interfaces. |
| **`@kurdel/core`** | Framework **contracts**, interfaces, and tokens — pure API layer with no runtime logic. |
| **`@kurdel/runtime`** | Runtime **implementation** — router, controller resolver, modules, adapters, lifecycle, etc. |
| **`@kurdel/facade`** | The **entry point** for applications — exports `createApplication()` and hides internal wiring. |
| **`@kurdel/ioc`** | Lightweight dependency injection container used across all modules. |
| **`@kurdel/db`** | Database layer — model abstractions, ORM helpers, and connection interfaces. |
| **`@kurdel/migrations`** | Database schema migration tools and CLI. |
| **`@kurdel/pirx`** | Simple CLI for project scaffolding, build helpers, and developer utilities. |

> **Dependency direction:**  
> `common → core → runtime → facade`  
> with `ioc`, `db`, `migrations`, and `pirx` acting as independent verticals.

---

## ✨ Features

- **IoC by contract** — powered by `@kurdel/ioc`, independent of framework internals.  
- **No decorators** — explicit and type-safe route/middleware definitions.  
- **Request scope** — each request gets its own DI container and controller instance.  
- **Lifecycle hooks** — modules can define startup and shutdown hooks.  
- **Typed routes** — route parameters validated at compile-time.  
- **Database-ready** — optional model layer with migration support.  
- **CLI tooling** — `@kurdel/pirx` for scaffolding and developer utilities.  
- **Testable** — `Application.listen()` returns a composable test handle.  

---

## ⚙️ Installation

```bash
npm i @kurdel/facade @kurdel/runtime @kurdel/core @kurdel/common @kurdel/ioc @kurdel/db
```

> Requires Node ≥ 18 and TypeScript ≥ 5
> Recommended `tsconfig.json`:
>
> ```json
> { "type": "module", "module": "nodenext" }
> ```

---

## 🚀 Quick Start

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

## 🧠 Core Concepts

### Application

Responsible for wiring modules, initializing IoC, and starting the HTTP adapter.

```ts
import type { Application } from '@kurdel/core/app';
```

Key methods:

* `use(...modules)` — register modules before bootstrap
* `listen(port)` — start server and return `RunningServer`

---

### Modules

Feature-level composition units.

```ts
import type { AppModule } from '@kurdel/core/app';
import type { ControllerConfig } from '@kurdel/core/http';

export class UserModule implements AppModule {
  readonly controllers: ControllerConfig[] = [
    { use: UserController, prefix: '/api' },
  ];

  async register(ioc, config) {
    // optional custom wiring
  }
}
```

---

### Controllers

Declare routes explicitly using `route()` — no decorators or metadata reflection.

```ts
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

export class UserController extends Controller {
  readonly routes = {
    list: route({ method: 'GET', path: '/users' })(this.list),
    byId: route({ method: 'GET', path: '/users/:id' })(this.byId),
  };

  async list() {
    return Ok([{ id: 1, name: 'Ada' }]);
  }

  async byId(ctx: HttpContext<{}, {}, { id: string }>) {
    return Ok({ id: ctx.params.id });
  }
}
```

---

## 🔁 Request-scoped IoC

Kurdel uses its own lightweight IoC container (`@kurdel/ioc`).
Each request spawns a **child scope**, ensuring isolated dependencies.

```ts
import { createToken } from '@kurdel/ioc';
const UserRepoToken = createToken<UserRepo>('users/UserRepo');

// container.bind(UserRepoToken).to(UserRepoImpl).inSingletonScope();
```

All framework-level dependencies (Router, ControllerResolver, etc.) are registered via `TOKENS.*`.

---

## 🧩 Lifecycle Hooks

Modules can define startup/shutdown hooks for custom logic.

```ts
import type { OnStartHook, OnShutdownHook } from '@kurdel/core/app/lifecycle';

class MetricsModule {
  readonly onStart: OnStartHook[] = [() => console.log('Started!')];
  readonly onShutdown: OnShutdownHook[] = [() => console.log('Stopped!')];
}
```

---

## 🧪 Testing

```ts
import request from 'supertest';
import { createApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';

class PingController extends Controller {
  readonly routes = { ping: route({ method: 'GET', path: '/ping' })(this.ping) };
  async ping() { return Ok({ ok: true }); }
}

const app = await createApplication({ modules: [{ controllers: [{ use: PingController }] }] });
const h = app.listen(0);

const res = await request(h.raw()!).get('/ping');
expect(res.status).toBe(200);
expect(res.body).toEqual({ ok: true });

await h.close();
```

---

## 🏗️ Monorepo Layout

```
packages/
  common/       # Shared primitives and HTTP types
  ioc/          # IoC container (standalone)
  core/         # Public API contracts (tokens, interfaces)
  runtime/      # Framework implementation (router, lifecycle, adapters)
  facade/       # Entry points (createApplication, helpers)
  db/           # Database layer (connectors, ORM utilities)
  migrations/   # Migration engine and CLI commands
  pirx/         # Developer CLI (scaffolding, utilities)
```

---

## 🤝 Contributing

* 📘 [ARCHITECTURE.md](./ARCHITECTURE.md) — detailed internal design overview
* 🛠️ [CONTRIBUTING.md](./CONTRIBUTING.md) — setup, build, commit conventions, and testing

---

## 🚧 Status

Kurdel is under active development.
Next milestones:

* In-memory HTTP adapter for isolated testing
* Richer database & migration APIs
* Unified `pirx` CLI workflow
* Route constraints & validation layer
* Extended middleware registry

---

© Andrii Sorokin · MIT License
