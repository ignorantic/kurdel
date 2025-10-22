# kurdel Architecture

kurdel is a **modular, strongly-typed** TypeScript framework built on explicit composition and contract-driven design.

```

@kurdel/common          → Shared primitives and base HTTP types
@kurdel/core            → Contracts / tokens / interfaces
@kurdel/runtime         → Core runtime (routing, middlewares, controllers)
@kurdel/runtime-node    → Native Node.js HTTP adapter
@kurdel/runtime-express → Express adapter
@kurdel/facade          → Public entry points (`createNodeApplication`, etc.)
@kurdel/ioc             → Standalone IoC container
@kurdel/db              → Database abstraction layer
@kurdel/migrations      → Migration engine and tools
@kurdel/pirx            → Developer CLI and utilities

```

---

## 🧠 Core Principles

- **Separation of what vs how**  
  - `core` defines *what* (contracts, tokens, types)  
  - `runtime` defines *how* (implementations and orchestration)

- **SOLID architecture** — each package does one thing and depends only on contracts  
- **Explicit DI** — no decorators, no hidden magic  
- **Request-scoped IoC** — every request has its own dependency graph  
- **Typed end-to-end** — from HTTP request to controller result  
- **Zero hidden coupling** — all dependencies are declared explicitly  

---

## ⚙️ Layer Overview

| Layer | Package | Example | Description |
|--------|----------|----------|-------------|
| **Common primitives** | `@kurdel/common` | `HttpRequest`, `HttpResponse`, `Result` | Shared low-level types and helpers |
| **Contracts / API** | `@kurdel/core` | `Application`, `Controller`, `ServerAdapter`, `TOKENS` | Core framework contracts |
| **Runtime** | `@kurdel/runtime` | `RuntimeApplication`, `RuntimeRouter`, `RuntimeControllerExecutor` | HTTP execution and orchestration |
| **Platform Adapters** | `@kurdel/runtime-node`, `@kurdel/runtime-express` | `NativeHttpServerAdapter`, `ExpressServerAdapter` | Platform-specific server bindings |
| **Facade** | `@kurdel/facade` | `createNodeApplication()` | User-facing entry points |
| **Database** | `@kurdel/db` | `Model`, `DbConnector` | Data layer abstraction |
| **Migrations** | `@kurdel/migrations` | `MigrationRunner`, `MigrationConfig` | Schema migration system |
| **CLI / Tooling** | `@kurdel/pirx` | `pirx generate`, `pirx db:migrate` | Developer tools and project scaffolding |

---

## 🔗 Dependency Graph

```

@kurdel/facade ─┬─► @kurdel/runtime-node / @kurdel/runtime-express
│               ├─► @kurdel/runtime
│               ├─► @kurdel/core
│               └─► @kurdel/ioc

@kurdel/runtime ─┬─► @kurdel/core
│                ├─► @kurdel/common
│                └─► @kurdel/ioc

@kurdel/core ───────► @kurdel/common
@kurdel/db ─────────► @kurdel/common
@kurdel/migrations ─► @kurdel/db
@kurdel/pirx ───────► @kurdel/migrations

```

> `@kurdel/facade` contains no logic — only high-level composition.  
> `@kurdel/common` sits at the bottom and has zero dependencies.

---

## 🧱 Application Lifecycle

1. **Configuration** — user defines `AppModule` with controllers and middlewares  
2. **Bootstrap** — `RuntimeApplication` wires modules, middlewares, and providers  
3. **Server Start** — platform adapter (`Node`, `Express`, etc.) starts listening  
4. **Request Handling** — router builds per-request scope and executes controller  
5. **Lifecycle Hooks** — `OnStart` / `OnShutdown` hooks run automatically  

---

## 🧩 Naming Rules

| Type | Prefix | Example |
|------|---------|---------|
| Contract implementation | `Runtime` | `RuntimeApplication`, `RuntimeRouter` |
| Platform adapter | `Native` / `Express` | `NativeHttpServerAdapter`, `ExpressServerAdapter` |
| Framework module | *(none)* | `ServerModule`, `ControllerModule` |
| CLI or tooling | `pirx` | `pirx db:migrate` |
| Test / mock | `Test` / `Fake` | `FakeController`, `TestServerAdapter` |

---

## 🧰 Extensibility

- All runtime contracts (router, controller resolver, etc.) can be overridden via IoC  
- Modules can register additional providers or override existing ones  
- `pirx` CLI supports plugin commands  
- Planned adapters: **Edge**, **Bun**, **Deno**, **Cloudflare Workers**

---

## 🧭 Internal Runtime Layout

```

src/
  runtime-application.ts
http/
  runtime-router.ts
  runtime-controller-resolver.ts
  runtime-controller-executor.ts
modules/
  server-module.ts
  controller-module.ts
  lifecycle-module.ts
  middleware-module.ts

```

---

## 🧩 Database & Migrations

### `@kurdel/db`
Provides:
- `DbConnector` interface and model abstractions  
- Base `Model` class with CRUD helpers  
- Optional model auto-registration module  

### `@kurdel/migrations`
Provides:
- Migration registry and runner  
- CLI commands (`pirx db:migrate`, `pirx db:rollback`)  
- Storage backends: filesystem, SQL, JSON  

---

## 🧮 CLI and Developer Tools

### `@kurdel/pirx`
Provides:
- `pirx new` — scaffold new apps  
- `pirx db:migrate` — run migrations  
- `pirx inspect` — inspect IoC bindings  
- `pirx build` — coordinate monorepo builds  

---

## 🧩 Public Imports

Users import from stable entry points only:

```ts
import { createNodeApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';
import type { AppModule } from '@kurdel/core/app';
````

---

## 🧩 Summary

✅ **`common`** — primitives
✅ **`core`** — contracts
✅ **`runtime`** — execution logic
✅ **`facade`** — public API
✅ **`ioc`** — dependency injection
✅ **`db` / `migrations`** — persistence layer
✅ **`pirx`** — CLI and tooling

---

> Kurdel follows a **strict layered model**:
> business logic never leaks upward, abstractions always depend inward.

---

© Andrii Sorokin · MIT License
