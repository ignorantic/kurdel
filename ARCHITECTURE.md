# kurdel Architecture

Kurdel is a **modular, strongly-typed** TypeScript framework built on explicit composition and contract-driven design.

---

## 🧩 Package Map

```

@kurdel/common          → Shared primitives and base HTTP types
@kurdel/core            → Contracts / tokens / interfaces
@kurdel/runtime         → Core runtime (routing, middleware, orchestration)
@kurdel/runtime-node    → Native Node.js HTTP adapter
@kurdel/runtime-express → Express adapter
@kurdel/template-ejs    → EJS template engine integration (SSR)
@kurdel/facade          → Public entry points (`createNodeApplication`, etc.)
@kurdel/ioc             → Standalone IoC container
@kurdel/db              → Database abstraction layer
@kurdel/migrations      → Migration engine and tools
@kurdel/pirx            → Developer CLI and utilities

```

---

## 🧠 Core Principles

- **Separation of What vs How**  
  - `core` defines *what* — contracts, tokens, and abstract types  
  - `runtime` defines *how* — concrete behavior and orchestration  

- **SOLID architecture** — each package has a single clear purpose  
- **Explicit DI** — no decorators or implicit injections  
- **Request-scoped IoC** — every HTTP request has an isolated dependency scope  
- **Fully typed flow** — from request to response renderer  
- **Zero hidden coupling** — all dependencies are declared explicitly  

---

## ⚙️ Layer Overview

| Layer | Package | Example | Description |
|--------|----------|----------|-------------|
| **Common primitives** | `@kurdel/common` | `HttpRequest`, `HttpResponse` | Shared low-level types |
| **Contracts / API** | `@kurdel/core` | `Controller`, `ServerAdapter`, `TOKENS` | Core framework interfaces |
| **Runtime** | `@kurdel/runtime` | `RuntimeRouter`, `RuntimeRequestOrchestrator` | Request execution and orchestration |
| **Platform Adapters** | `@kurdel/runtime-node`, `@kurdel/runtime-express` | `NativeHttpServerAdapter`, `ExpressServerAdapter` | Platform bindings |
| **Template Engines** | `@kurdel/template-ejs` | `EjsTemplateModule` | Server-side rendering |
| **Facade** | `@kurdel/facade` | `createNodeApplication()` | Simplified application entry points |
| **IoC Container** | `@kurdel/ioc` | `createContainer`, `bind()` | Dependency injection system |
| **Database** | `@kurdel/db` | `Model`, `DbConnector` | Data layer abstractions |
| **Migrations** | `@kurdel/migrations` | `MigrationRunner` | Schema migration tools |
| **CLI / Tooling** | `@kurdel/pirx` | `pirx db:migrate` | Developer utilities |

---

## 🔗 Dependency Graph

```

@kurdel/facade ─┬─► @kurdel/runtime-node / @kurdel/runtime-express
│               ├─► @kurdel/runtime
│               ├─► @kurdel/core
│               ├─► @kurdel/template-ejs
│               └─► @kurdel/ioc
│
@kurdel/runtime ─┬─► @kurdel/core
│                ├─► @kurdel/common
│                └─► @kurdel/ioc
│
@kurdel/core ────────► @kurdel/common
@kurdel/db ──────────► @kurdel/common
@kurdel/migrations ──► @kurdel/db
@kurdel/pirx ────────► @kurdel/migrations

```

> `@kurdel/facade` orchestrates all dependencies but contains no runtime logic.  
> `@kurdel/common` sits at the very bottom with zero dependencies.

---

## 🚦 Runtime Flow (Post-Decomposition)

```

Request
├─► ServerAdapter.on(req, res)
├─► RuntimeRequestOrchestrator.execute()
├─► RuntimeRouter.resolve() → finds RouteMatch
├─► RuntimeHttpContextFactory.create()
├─► RuntimeControllerPipe / RuntimeMiddlewarePipe
└─► ResponseRenderer.render()

```

### Key responsibilities

| Component | Role |
|------------|------|
| **RuntimeRouter** | Resolves routes and path params only |
| **RuntimeRequestOrchestrator** | Coordinates the full request lifecycle |
| **RuntimeMiddlewarePipe** | Sequentially executes global and scoped middlewares |
| **RuntimeControllerPipe** | Executes controller middlewares + target action |
| **ResponseRenderer** | Converts `ActionResult` → HTTP response |
| **ServerModule** | Wires together router, orchestrator, and adapter |

---

## 🧱 Application Lifecycle

1. **Configuration** — define `AppModule` with imports, providers, and controllers  
2. **Bootstrap** — `RuntimeApplication` builds IoC container and validates modules  
3. **Server start** — `ServerModule` subscribes orchestrator to adapter events  
4. **Request handling** — orchestrator creates per-request scope and context  
5. **Routing** — router finds controller + action and params  
6. **Execution** — middleware chain and controller logic run  
7. **Rendering** — renderer outputs the final response  

---

## ⚙️ Module Priorities

| Priority | Enum | Typical Module | Purpose |
|-----------|-------|----------------|----------|
| `10` | `Lifecycle` | `LifecycleModule` | Start/stop hooks |
| `20` | `Database` | `DatabaseModule` | DB setup |
| `30` | `User` | Application modules | User-level providers |
| `40` | `Model` | `ModelModule` | Model registration |
| `50` | `Middleware` | `MiddlewareModule` | Global middleware registration |
| `60` | `Controller` | `ControllerModule` | Controllers and routes |
| `65` | `Platform` | `NodePlatformModule`, `ExpressPlatformModule` | Adapter + renderer |
| `70` | `Server` | `ServerModule` | Connects adapter + orchestrator |
| `100` | `Custom` | — | Default for unknown modules |

---

## 🧭 Internal Runtime Layout

```

src/
  app/
    runtime-application.ts
http/
  runtime-router.ts
  runtime-request-orchestrator.ts
  runtime-controller-pipe.ts
  runtime-middleware-pipe.ts
  runtime-http-context-factory.ts
modules/
  server-module.ts
  controller-module.ts
  lifecycle-module.ts
  middleware-module.ts

```

---

## 🧩 Summary of the Refactor

✅ Router is now **pure** — it only resolves routes and parameters.  
✅ Orchestrator is **central** — it manages middleware, controller, and rendering.  
✅ Middleware chains are unified through reusable `RuntimeMiddlewarePipe`.  
✅ Global middlewares are no longer part of the router — they live in `ServerModule`.  
✅ Test suite migrated to integration-level route orchestration coverage.  

---

> **Result:**  
> The runtime layer is now more testable, composable, and platform-agnostic —  
> no implicit routing behavior or hidden dependencies remain.

---

© Andrii Sorokin · MIT License