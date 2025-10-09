# kurdel Architecture

kurdel is a modular, strongly-typed framework organized into clearly separated layers:

```
@kurdel/core      → Contracts / tokens / base types
@kurdel/runtime   → Runtime implementations and composition
@kurdel/facade    → Entry points for users
@kurdel/ioc       → Standalone IoC library

```

---

## 🧠 Core principles

- **Separation of what vs how**
  - `core` defines *what* (interfaces, contracts, types)
  - `runtime` defines *how* (implementations and composition)
- **No decorators or hidden globals** — everything is explicit.
- **Request-scoped IoC** — a new DI scope per request.
- **Typed end-to-end** — routes, params, and results are fully type-checked.

---

## ⚙️ Layers overview

| Layer | Location | Example | Description |
|--------|-----------|----------|-------------|
| **API (contracts)** | `@kurdel/core/...` | `Application`, `ServerAdapter`, `TOKENS` | Public framework contracts |
| **Runtime** | `@kurdel/runtime/...` | `RuntimeApplication`, `RuntimeRouter`, `NativeHttpServerAdapter` | Executable implementation |
| **Modules** | `@kurdel/runtime/modules/...` | `ServerModule`, `ControllerModule` | IoC wiring and composition |
| **Facade** | `@kurdel/facade/...` | `createApplication()` | Simplified user entry points |
| **Samples** | `sample/` | `01-simple-app` | Example applications |

---

## 🧩 Naming rules

| Type | Prefix | Example |
|------|---------|---------|
| Contract implementation | `Runtime` | `RuntimeApplication`, `RuntimeRouter` |
| Platform adapter | `Native` | `NativeHttpServerAdapter` |
| Framework module | *(none)* | `ServerModule`, `LifecycleModule` |
| Test-only / mock | `Test` / `Fake` | `TestServerAdapter`, `FakeControllerResolver` |

---

## 🔗 Dependency graph

```
@kurdel/facade ─┬─► @kurdel/runtime
└─► @kurdel/core
@kurdel/runtime ─┬─► @kurdel/core
└─► @kurdel/ioc
@kurdel/core ───► @kurdel/ioc (types only)

```

> The **facade** layer contains no business logic — it only wires `core` and `runtime`.

---

## 🧱 Application lifecycle

1. **Configuration** — user defines `AppConfig` with modules  
2. **Bootstrap** — `RuntimeApplication` calls `.register()` on each module  
3. **Listen** — `ServerAdapter.listen()` starts the HTTP server  
4. **Hooks** — `LifecycleModule` triggers `OnStart` / `OnShutdown`

---

## 🧰 Extensibility

- Any contract (`ServerAdapter`, `Router`, `ControllerResolver`, …) can be replaced in IoC  
- Custom modules can be registered via `app.use(...)`  
- Planned adapters: **Edge**, **Bun**, **Cloudflare Workers**

---

## 🧩 Public imports

Users import from stable subpaths:

```ts
import { createApplication } from '@kurdel/core';
import { Controller, route, Ok } from '@kurdel/core/http';
import type { AppModule } from '@kurdel/core/app';
```

---

## 🧭 Internal runtime layout

```
src/runtime/
  app/
    runtime-application.ts
  router/
    runtime-router.ts
    runtime-controller-resolver.ts
  http/
    native-http-server-adapter.ts
  modules/
    server-module.ts
    controller-module.ts
    lifecycle-module.ts
```

---

## 🧩 Summary

* Contracts live in **`core`**
* Implementations live in **`runtime`**
* Platform-specific code uses **`Native*`**
* Core framework implementations use **`Runtime*`**
* Modules remain simple and prefix-free (`ServerModule`, `LifecycleModule`)