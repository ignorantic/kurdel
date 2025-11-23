# **kurdel**

A minimal **TypeScript-first** web framework built on **SOLID** and **IoC** principles.
No decorators. No reflection. Just **explicit modules**, **typed controllers**, **runtime schemas**, and **request-scoped DI**.

---

## 🧩 Architecture Overview

Kurdel is a **modular monorepo** — every package has a single responsibility and depends only on stable contracts.

| Package                       | Purpose                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **`@kurdel/common`**          | Shared low-level primitives: HTTP types, URL/query helpers, and base interfaces. |
| **`@kurdel/core`**            | Framework **contracts**, tokens, and public API interfaces.                      |
| **`@kurdel/runtime`**         | Core runtime: router, orchestrator, middleware, lifecycle, and context factory.  |
| **`@kurdel/runtime-node`**    | Native Node.js HTTP adapter and response renderer.                               |
| **`@kurdel/runtime-express`** | Express platform adapter for Kurdel runtime.                                     |
| **`@kurdel/template-ejs`**    | Integration with **EJS** templates for SSR.                                      |
| **`@kurdel/template-react`**  | Integration with **React** templates for server-side rendering (JSX).            |
| **`@kurdel/facade`**          | Public entry point — `createNodeApplication()`, `createExpressApplication()`.    |
| **`@kurdel/ioc`**             | Lightweight, standalone dependency injection container.                          |
| **`@kurdel/db`**              | Database abstraction layer (models, connectors, query builders).                 |
| **`@kurdel/migrations`**      | Migration engine and schema management tools.                                    |
| **`@kurdel/pirx`**            | Developer CLI (scaffolding, migrations, utilities).                              |

> **Dependency direction:**
> `common → core → runtime → runtime-{platform} → facade`
> with `ioc`, `template-*`, `db`, `migrations`, and `pirx` as vertical extensions.

---

## ✨ Features

* 🧠 **IoC by contract** — explicit, constructor-based dependency injection.
* 🧩 **No decorators or reflection** — predictable, type-safe, testable.
* 🌀 **Request-scoped IoC** — each request has its own isolated container.
* ⚙️ **Runtime orchestration** — router and orchestrator clearly separated.
* 🧾 **Schema-based validation** — route-level validation via adapters (`zodAdapter`, etc.).
* 🔄 **Middleware zones** — `pre`, `controller`, `post`, and `final` phases.
* 🧱 **Lifecycle hooks** — start/stop via `LifecycleModule`.
* 🗄️ **Database-ready** — plug in any DB with `@kurdel/db`.
* 🧪 **Test-friendly** — in-memory orchestration, zero boilerplate.
* 🎨 **SSR-ready** — EJS and React template engines.
* 🧰 **CLI tooling** — `@kurdel/pirx` for scaffolding and automation.

---

## ⚙️ Installation

```bash
npm i @kurdel/facade @kurdel/runtime @kurdel/core @kurdel/common @kurdel/ioc @kurdel/template-ejs
```

> Requires **Node ≥ 18** and **TypeScript ≥ 5**

Example `tsconfig.json`:

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

class HelloController extends Controller {
  readonly routes = {
    hello: route({ method: 'GET', path: '/hello' })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({ message: 'Hello, Kurdel!' });
  }
}

const HelloModule = { controllers: [{ use: HelloController }] };

const app = await createNodeApplication({ modules: [HelloModule] });
app.listen(3000, () => console.log('🚀 http://localhost:3000'));
```

---

## 🧠 Core Concepts

### 🧩 Application

Composes modules, initializes IoC, and wires runtime components.

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

Explicit, type-safe routes — no decorators, no magic.

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

  async byId(ctx: HttpContext<unknown, { id: string }>) {
    return Ok({ id: ctx.params.id });
  }
}
```

---

## 🧾 Route Schemas & Validation

Each route may define a `schema` describing the request shape.

```ts
import { z } from 'zod';
import { zodAdapter } from '@kurdel/runtime/middlewares';

export class UserController extends Controller {
  readonly routes = {
    create: route({
      method: 'POST',
      path: '/',
      schema: {
        body: zodAdapter(z.object({
          name: z.string().min(2),
          role: z.string().min(2),
        })),
      },
    })(this.create),
  };

  async create(ctx: HttpContext<{ name: string; role: string }>) {
    return Created(ctx.body);
  }
}
```

### Validation flow

* Schemas are declared per route.
* The runtime automatically picks up `ctx.route.schema`.
* A `schemaValidator` middleware validates params/query/body.
* Adapters (like Zod or Yup) convert native errors to `ValidationError`.

---

## 🔁 Request Lifecycle

```
ServerAdapter.on(req, res)
 └─► RuntimeRequestOrchestrator.execute()
      ├─► RuntimeRouter.resolve(method, url)
      │    └─► RouteMatch (controller, action, schema)
      ├─► RuntimeHttpContextFactory.create()
      ├─► RuntimeMiddlewarePipe (pre)
      ├─► RuntimeControllerPipe
      ├─► RuntimeMiddlewarePipe (post)
      ├─► ResponseRenderer.render()
      └─► RuntimeMiddlewarePipe (final)
```

| Component                      | Responsibility                                        |
| ------------------------------ | ----------------------------------------------------- |
| **RuntimeRouter**              | Resolves routes, params, and schema.                  |
| **RuntimeHttpContextFactory**  | Builds per-request context (req, res, route, result). |
| **RuntimeRequestOrchestrator** | Manages full lifecycle and zones.                     |
| **RuntimeMiddlewarePipe**      | Executes global and scoped middleware sequences.      |
| **RuntimeControllerPipe**      | Invokes controller-level middlewares and actions.     |
| **ResponseRenderer**           | Converts `ActionResult` into an HTTP response.        |

---

## 🎨 Template Engines

### EJS Example

```ts
import { EjsTemplateModule } from '@kurdel/template-ejs';
import { createNodeApplication } from '@kurdel/facade';

const app = await createNodeApplication({
  modules: [EjsTemplateModule.forRoot({ baseDir: 'views' })],
});
```

### React Example

```ts
import { ReactTemplateModule } from '@kurdel/template-react';

const app = await createNodeApplication({
  modules: [ReactTemplateModule.forRoot()],
});
```

---

## 🧪 Testing

In-memory tests using `supertest` and `createNodeApplication`:

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
  common/            # Shared primitives and HTTP types
  core/              # Contracts, tokens, and interfaces
  runtime/           # Router, orchestrator, middleware, lifecycle
  runtime-node/      # Node.js adapter
  runtime-express/   # Express adapter
  template-ejs/      # EJS SSR integration
  template-react/    # React SSR integration
  ioc/               # IoC container
  facade/            # Public entry points
  db/                # Database abstraction
  migrations/        # Migration engine
  pirx/              # CLI tooling
samples/             # Example applications
```

---

## 🚧 Roadmap

* ⚡ Bun, Deno, and Cloudflare adapters
* 🧩 More schema adapters (Yup, AJV)
* 🧱 Improved module dependency graph visualization
* 🧰 Pirx workspace automation (`pirx build`, `pirx dev`)
* 🧪 In-memory HTTP adapter for unit testing
* 🎨 Hot-reloadable React SSR pipeline

---

© 2025 Andrii Sorokin · MIT License
