# kurdel Architecture

kurdel is a **modular, strongly-typed** framework built around clear separation of layers and explicit composition.

```

@kurdel/common     → Shared primitives and base HTTP types
@kurdel/core       → Contracts / tokens / interfaces
@kurdel/runtime    → Runtime implementations and IoC composition
@kurdel/facade     → Public entry points (createApplication)
@kurdel/ioc        → Standalone IoC container
@kurdel/db         → Database abstraction layer
@kurdel/migrations → Migration engine and tools
@kurdel/pirx       → Developer CLI and utilities

```

---

## 🧠 Core Principles

- **Separation of what vs how**  
  - `core` defines *what* (contracts, tokens, types)  
  - `runtime` defines *how* (implementations and composition)

- **SOLID architecture** — each module does one thing and depends only on contracts.  
- **Explicit DI** — no decorators, no magic globals.  
- **Request-scoped IoC** — every request gets its own dependency scope.  
- **Typed end-to-end** — parameters, context, and results are compile-time safe.  
- **Zero hidden coupling** — all dependencies are injected or declared explicitly.

---

## ⚙️ Layer Overview

| Layer | Package | Example | Description |
|--------|----------|----------|-------------|
| **Common primitives** | `@kurdel/common` | `HttpRequest`, `HttpResponse`, `Result` | Shared low-level types and helpers |
| **Contracts / API** | `@kurdel/core` | `Application`, `Controller`, `ServerAdapter`, `TOKENS` | Pure framework contracts |
| **Runtime** | `@kurdel/runtime` | `RuntimeApplication`, `RuntimeRouter`, `NativeHttpServerAdapter` | Actual framework logic and composition |
| **Modules (internal)** | `@kurdel/runtime/modules` | `ServerModule`, `ControllerModule`, `LifecycleModule` | IoC-based runtime modules |
| **Facade** | `@kurdel/facade` | `createApplication()` | User-facing entry points |
| **Database** | `@kurdel/db` | `Model`, `DbConnector` | Data layer and ORM abstraction |
| **Migrations** | `@kurdel/migrations` | `MigrationRunner`, `MigrationConfig` | Schema migration system |
| **CLI / Tooling** | `@kurdel/pirx` | `pirx generate`, `pirx new` | Developer tools and project scaffolding |

---

## 🔗 Dependency Graph

```

@kurdel/facade ─┬─► @kurdel/runtime
├─► @kurdel/core
└─► @kurdel/ioc

@kurdel/runtime ─┬─► @kurdel/core
├─► @kurdel/common
└─► @kurdel/ioc

@kurdel/core ───► @kurdel/common
@kurdel/db ─────► @kurdel/common
@kurdel/migrations ─► @kurdel/db
@kurdel/pirx ───► @kurdel/migrations

```

> The **facade** has no business logic — it only composes `core` and `runtime`.  
> The **common** package sits at the very bottom and contains no dependencies.

---

## 🧱 Application Lifecycle

1. **Configuration** — the user defines `AppConfig` and feature modules.  
2. **Bootstrap** — `RuntimeApplication` registers modules, providers, and lifecycle hooks.  
3. **Server Start** — `ServerAdapter.listen()` starts the HTTP server.  
4. **Request Handling** — router resolves per-request scope and executes the controller.  
5. **Lifecycle Hooks** — `OnStart` and `OnShutdown` hooks run automatically.  

---

## 🧩 Naming Rules

| Type | Prefix | Example |
|------|---------|---------|
| Contract implementation | `Runtime` | `RuntimeApplication`, `RuntimeRouter` |
| Platform adapter | `Native` | `NativeHttpServerAdapter` |
| Framework module | *(none)* | `ServerModule`, `LifecycleModule` |
| CLI or tooling | `pirx` | `pirx generate`, `pirx db:migrate` |
| Test / mock | `Test` / `Fake` | `FakeController`, `TestServerAdapter` |

---

## 🧰 Extensibility

- Any contract (e.g. `Router`, `ServerAdapter`, `ControllerResolver`) can be replaced via IoC.  
- Modules can provide their own providers or override existing bindings.  
- `pirx` CLI provides plugin hooks for extending commands.  
- Planned adapters: **Edge**, **Bun**, **Deno**, **Cloudflare Workers**.

---

## 🧭 Internal Runtime Layout

```

src/
app/
runtime-application.ts
router/
runtime-router.ts
runtime-controller-resolver.ts
http/
native-http-server-adapter.ts
runtime-controller-executor.ts
modules/
server-module.ts
controller-module.ts
model-module.ts
middleware-module.ts
lifecycle-module.ts

```

---

## 🧩 Database & Migrations

### `@kurdel/db`
Provides:
- Unified `DbConnector` interface for adapters (Postgres, SQLite, etc.)
- Base `Model` abstraction and query utilities.
- Optional integration module for automatic model registration.

### `@kurdel/migrations`
Provides:
- Migration runner and registry.
- Command-line migration tools (`pirx db:migrate`, `pirx db:rollback`).
- Pluggable storage backends (filesystem, SQL table, JSON).

---

## 🧮 CLI and Developer Tools

### `@kurdel/pirx`

A minimal CLI layer that integrates directly with the runtime and migrations:
- `pirx new` — scaffold new apps or modules.  
- `pirx db:migrate` — run pending migrations.  
- `pirx inspect` — print IoC bindings and dependency graph.  
- `pirx build` — orchestrate build pipeline via Lerna/Nx.  

---

## 🧩 Public Imports

Users always import from stable entry points:

```ts
import { createApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';
import type { AppModule } from '@kurdel/core/app';
```

---

## 🧩 Summary

✅ **`common`** — shared primitives
✅ **`core`** — contracts and tokens
✅ **`runtime`** — framework implementation
✅ **`facade`** — user entry point
✅ **`ioc`** — DI container
✅ **`db` / `migrations`** — persistence & schema management
✅ **`pirx`** — CLI and developer tooling

---

> Kurdel follows a **strict layering model**:
> business logic never leaks upward, and abstractions always depend inward.

---

© Andrii Sorokin · MIT License
