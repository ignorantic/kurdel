# kurdel

A minimal **TypeScript-first** web framework built on **SOLID** and **IoC** principles.  
No decorators. No reflection. Just **explicit modules**, **typed controllers**, and **request-scoped DI**.

---

## 🧩 Architecture Overview

Kurdel is a **modular monorepo** — every package is responsible for a single concern and depends only on stable contracts.

| Package | Purpose |
|----------|----------|
| **`@kurdel/common`** | Shared low-level primitives: HTTP types, helpers, and base interfaces. |
| **`@kurdel/core`** | Framework **contracts**, tokens, and type definitions — pure API layer. |
| **`@kurdel/runtime`** | Core runtime — router, request orchestrator, middleware, and lifecycle. |
| **`@kurdel/runtime-node`** | Native Node.js HTTP adapter + renderer. |
| **`@kurdel/runtime-express`** | Express adapter + platform module. |
| **`@kurdel/template-ejs`** | Integration with **EJS** templates for SSR rendering. |
| **`@kurdel/facade`** | High-level entry point — exports `createNodeApplication()` and `createExpressApplication()`. |
| **`@kurdel/ioc`** | Lightweight dependency injection container shared across layers. |
| **`@kurdel/db`** | Database abstraction layer — models, connectors, and query helpers. |
| **`@kurdel/migrations`** | Migration engine and schema management tools. |
| **`@kurdel/pirx`** | Developer CLI for scaffolding, migrations, and project utilities. |

> **Dependency direction:**  
> `common → core → runtime → runtime-{platform} → facade`  
> with `ioc`, `template-*`, `db`, `migrations`, and `pirx` as vertical extensions.

---

## ✨ Features

- 🧠 **IoC by contract** — powered by `@kurdel/ioc`, fully standalone.  
- 🧩 **No decorators** — explicit, predictable, type-safe.  
- 🌀 **Request scope** — each request gets its own IoC container.  
- 🔄 **Runtime orchestration** — separated router and orchestrator for clarity.  
- ⚙️ **Lifecycle hooks** — modules can react to startup/shutdown.  
- 🧾 **Typed routes** — controller methods and responses are fully typed.  
- 🗄️ **Database-ready** — optional model + migration system.  
- 🧪 **Test-friendly** — composable runtime and in-memory testing.  
- 🧰 **CLI tooling** — `@kurdel/pirx` for scaffolding and migrations.  
- 🎨 **SSR-ready** — EJS integration via the `TemplateEngine` interface.  

---

## ⚙️ Installation

```bash
npm i @kurdel/facade @kurdel/runtime @kurdel/core @kurdel/common @kurdel/ioc @kurdel/template-ejs
```

> Requires **Node ≥ 18** and **TypeScript ≥ 5**
> Example `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext"
  },
  "type": "module"
}
```

---

## 🚀 Quick Start

```ts
// app.ts
import { createNodeApplication } from '@kurdel/facade';
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

// 1) Controller — explicit, typed routes
class HelloController extends Controller {
  readonly routes = {
    hello: route({ method: 'GET', path: '/hello' })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({ message: 'Hello, Kurdel!' });
  }
}

// 2) Application module
const HelloModule = {
  controllers: [{ use: HelloController }],
};

// 3) Bootstrap
const app = await createNodeApplication({ modules: [HelloModule] });
const server = app.listen(3000, () => console.log('🚀 http://localhost:3000'));
```

---

## 🧠 Core Concepts

### 🧩 Application

Responsible for composing modules, initializing IoC, and starting the HTTP server.

```ts
import type { Application } from '@kurdel/core/app';
```

### 🧱 Modules

Modules declare controllers, middlewares, or providers.

```ts
import type { AppModule } from '@kurdel/core/app';
import { UserController } from './user.controller.js';

export const UserModule: AppModule = {
  controllers: [{ use: UserController, prefix: '/api' }],
};
```

### 🎮 Controllers

Explicitly declare routes — no decorators, no reflection.

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

  async byId(ctx: HttpContext<{}, { id: string }>) {
    return Ok({ id: ctx.params.id });
  }
}
```

---

## 🔁 Request Lifecycle

```
ServerAdapter.on(req, res)
 └─► RuntimeRequestOrchestrator.execute()
      ├─► RuntimeRouter.resolve(method, url)
      │    └─► returns RouteMatch (controller, action, params)
      ├─► RuntimeHttpContextFactory.create()
      ├─► RuntimeControllerPipe / RuntimeMiddlewarePipe
      └─► ResponseRenderer.render(result)
```

| Component                      | Responsibility                                             |
| ------------------------------ | ---------------------------------------------------------- |
| **RuntimeRouter**              | Resolves routes and extracts path params.                  |
| **RuntimeRequestOrchestrator** | Coordinates full HTTP request flow.                        |
| **RuntimeMiddlewarePipe**      | Executes middleware sequences.                             |
| **RuntimeControllerPipe**      | Invokes controller middlewares and actions.                |
| **ResponseRenderer**           | Converts `ActionResult` → HTTP response.                   |
| **ServerModule**               | Wires router, orchestrator, and platform adapter together. |

---

## 🧱 Template Engine

Kurdel ships with **EJS** integration for SSR.

```ts
import { EjsTemplateModule } from '@kurdel/template-ejs';
import { createNodeApplication } from '@kurdel/facade';

const app = await createNodeApplication({
  modules: [EjsTemplateModule.forRoot({ baseDir: 'views' })],
});
```

Controller example:

```ts
import { Controller, route, View } from '@kurdel/core/http';

export class HomeController extends Controller {
  readonly routes = {
    home: route({ method: 'GET', path: '/' })(this.home),
  };

  async home() {
    return View('home', { title: 'Welcome to Kurdel!' });
  }
}
```

> ✅ Works across Node and Express via shared `TemplateEngine` interface.

---

## 🧩 Testing

Use `supertest` with `createNodeApplication()` for fully in-memory testing:

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

## 🧭 Monorepo Layout

```
packages/
  common/           # Shared primitives and HTTP types
  core/             # Contracts, tokens, and interfaces
  runtime/          # Router, orchestrator, and middleware pipelines
  runtime-node/     # Node.js HTTP adapter
  runtime-express/  # Express adapter
  facade/           # Public entry points
  ioc/              # Dependency injection container
  template-ejs/     # EJS SSR integration
  db/               # Database abstraction
  migrations/       # Migration tools
  pirx/             # Developer CLI
samples/            # Example applications
```

---

## 🚧 Roadmap

* 🪶 Handlebars / Mustache template engines
* ⚡ Bun and Deno runtime adapters
* 🧩 Route validation and constraints
* 🧠 Improved middleware composition registry
* 🧰 Pirx workflow automation (`pirx build`, `pirx dev`)
* 🧪 In-memory HTTP adapter for unit testing

---

© Andrii Sorokin · MIT License
