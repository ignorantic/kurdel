# kurdel

A tiny **TypeScript-first** web framework built on SOLID + IoC.  
Clear boundaries, **no decorators**, explicit modules & providers, typed results, and **request-scoped DI**.

---

## 🧩 Architecture Overview

Kurdel is a **modular monorepo** — each package focuses on a single concern and depends only on stable contracts.

| Package | Purpose |
|----------|----------|
| **`@kurdel/common`** | Shared low-level primitives: HTTP types, helpers, and base interfaces. |
| **`@kurdel/core`** | Framework **contracts**, interfaces, and tokens — pure API layer with no runtime logic. |
| **`@kurdel/runtime`** | Runtime **implementation** — router, controller resolver, modules, middlewares, and lifecycle orchestration. |
| **`@kurdel/runtime-node`** | Native Node.js HTTP adapter. |
| **`@kurdel/runtime-express`** | Express runtime adapter. |
| **`@kurdel/facade`** | Application **entry point** — exports `createNodeApplication()` and `createExpressApplication()`. |
| **`@kurdel/ioc`** | Lightweight dependency injection container used across all layers. |
| **`@kurdel/template-ejs`** | Integration with **EJS** templates for SSR rendering. |
| **`@kurdel/db`** | Database abstraction layer — model base classes, query helpers, connectors. |
| **`@kurdel/migrations`** | Schema migration tools and registry. |
| **`@kurdel/pirx`** | Developer CLI for scaffolding, migrations, and utilities. |

> **Dependency direction:**  
> `common → core → runtime → runtime-{platform} → facade`  
> with `ioc`, `template-*`, `db`, `migrations`, and `pirx` acting as parallel verticals.

---

## ✨ Features

- **IoC by contract** — powered by `@kurdel/ioc`, completely standalone.  
- **No decorators** — everything is explicit and type-safe.  
- **Request scope** — each request runs in an isolated DI container.  
- **Lifecycle hooks** — modules can register startup and shutdown callbacks.  
- **Typed routes** — controller inputs and outputs are validated at compile time.  
- **Database-ready** — optional model layer and migration system.  
- **CLI tooling** — `@kurdel/pirx` for scaffolding and developer utilities.  
- **Unified runtimes** — shared HTTP adaptation for Node and Express.  
- **Test-friendly** — composable runtime with `supertest` integration.  
- **SSR-ready** — built-in EJS templating module.

---

## 🧱 Template Engine

Kurdel ships with a lightweight integration for **EJS** to support server-side rendering out of the box.

| Package | Engine | Description |
|----------|---------|-------------|
| **`@kurdel/template-ejs`** | [EJS](https://ejs.co/) | Simple logic-based templates with partials and layouts. |

Register the template module in your app:

```ts
import { EjsTemplateModule } from '@kurdel/template-ejs';
import { createNodeApplication } from '@kurdel/facade';

const app = await createNodeApplication({
  modules: [
    EjsTemplateModule.forRoot({ baseDir: 'views' }),
  ],
});

app.listen(3000);
```

Render a view directly from your controller:

```ts
import { Controller, route, View } from '@kurdel/core/http';

export class HomeController extends Controller {
  readonly routes = {
    index: route({ method: 'GET', path: '/' })(this.index),
  };

  async index() {
    return View('home', { title: 'Welcome to Kurdel!' });
  }
}
```

> ✅ Works seamlessly across Node and Express runtimes
> via a unified `TemplateEngine` interface inside `@kurdel/runtime`.

---

## ⚙️ Installation

```bash
npm i @kurdel/facade @kurdel/runtime @kurdel/core @kurdel/common @kurdel/ioc @kurdel/template-ejs
```

> Requires Node ≥ 18 and TypeScript ≥ 5
> Recommended `tsconfig.json`:
>
> ```json
> {
>   "compilerOptions": {
>     "module": "nodenext",
>     "moduleResolution": "nodenext"
>   },
>   "type": "module"
> }
> ```

---

## 🚀 Quick Start

```ts
// app.ts
import { createNodeApplication } from '@kurdel/facade';
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

// 1) Controller: explicit routes
class HelloController extends Controller {
  readonly routes = {
    hello: route({ method: 'GET', path: '/hello' })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({ message: 'Hello, kurdel!' });
  }
}

// 2) Application module
class HelloModule {
  readonly controllers = [{ use: HelloController }];
}

// 3) Bootstrap
const app = await createNodeApplication({ modules: [new HelloModule()] });
const server = app.listen(3000, () => console.log('http://localhost:3000'));
```

---

## 🧠 Core Concepts

### Application

Handles module wiring, IoC initialization, and HTTP server startup.

```ts
import type { Application } from '@kurdel/core/app';
```

Key methods:

* `use(...modules)` — register modules before bootstrap
* `listen(port)` — start the server and return a handle

---

### Modules

Feature-level composition units — register controllers, providers, and lifecycle hooks.

```ts
import type { AppModule } from '@kurdel/core/app';
import type { ControllerConfig } from '@kurdel/core/http';

export class UserModule implements AppModule {
  readonly controllers: ControllerConfig[] = [
    { use: UserController, prefix: '/api' },
  ];

  async register(ioc, config) {
    // optional custom bindings
  }
}
```

---

### Controllers

Routes are declared explicitly via `route()` helpers — no decorators, no metadata reflection.

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

Kurdel uses its own IoC container (`@kurdel/ioc`), independent of any framework.
Every request spawns a **child scope**, isolating dependencies automatically.

```ts
import { createToken } from '@kurdel/ioc';
const UserRepoToken = createToken<UserRepo>('users/UserRepo');

container.bind(UserRepoToken).to(UserRepoImpl).inSingletonScope();
```

Framework-level bindings (router, resolvers, etc.) are registered via `TOKENS`.

---

## 🧩 Lifecycle Hooks

Modules can hook into startup and shutdown events:

```ts
import type { OnStartHook, OnShutdownHook } from '@kurdel/core/app/lifecycle';

class MetricsModule {
  readonly onStart: OnStartHook[] = [() => console.log('Server started')];
  readonly onShutdown: OnShutdownHook[] = [() => console.log('Server stopped')];
}
```

---

## 🧪 Testing

Use `supertest` to validate controllers without real network sockets.

```ts
import request from 'supertest';
import { createNodeApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';

class PingController extends Controller {
  readonly routes = { ping: route({ method: 'GET', path: '/ping' })(this.ping) };
  async ping() { return Ok({ ok: true }); }
}

const app = await createNodeApplication({
  modules: [{ controllers: [{ use: PingController }] }],
});

const server = app.listen(0);
const res = await request(server.raw()).get('/ping');

expect(res.status).toBe(200);
expect(res.body).toEqual({ ok: true });

await server.close();
```

---

## 🏗️ Monorepo Layout

```
packages/
  common/           # Shared primitives and HTTP types
  core/             # Contracts, tokens, and interfaces
  runtime/          # Runtime orchestration and middleware chain
  runtime-node/     # Native Node.js HTTP adapter
  runtime-express/  # Express adapter
  facade/           # Entry points (createNodeApplication, etc.)
  ioc/              # Dependency injection container
  template-ejs/     # EJS template engine integration for SSR
  db/               # Database abstractions and connectors
  migrations/       # Migration runner and schema tools
  pirx/             # CLI for developer utilities
samples/            # Example applications
```

---

## 🚧 Status

Kurdel is under active development.
Next milestones:

* Handlebars template engine module
* In-memory HTTP adapter for isolated tests
* Improved migration & ORM APIs
* Unified `pirx` project workflow
* Built-in route validation and constraints
* Advanced middleware registry and composition tools

---

© Andrii Sorokin · MIT License