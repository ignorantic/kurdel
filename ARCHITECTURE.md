# kurdel Architecture

Kurdel is a **modular, strongly-typed** TypeScript framework built on **explicit composition** and **contract-driven design**, emphasizing deterministic runtime behavior and strict type safety across the entire request lifecycle.

---

## 🧩 Package Map

```
@kurdel/common          → Shared primitives and base HTTP types
@kurdel/core            → Contracts / tokens / interfaces
@kurdel/runtime         → Core runtime (routing, middleware, orchestration)
@kurdel/runtime-node    → Native Node.js HTTP adapter
@kurdel/runtime-express → Express adapter
@kurdel/template-ejs    → EJS template engine integration (SSR)
@kurdel/template-react  → React template engine integration (SSR + JSX rendering)
@kurdel/facade          → Public entry points (`createNodeApplication`, etc.)
@kurdel/ioc             → Standalone IoC container
@kurdel/db              → Database abstraction layer
@kurdel/migrations      → Migration engine and tools
@kurdel/pirx            → Developer CLI and utilities
```

---

## 🧠 Core Principles

* **Separation of What vs How**

  * `@kurdel/core` defines **what** — contracts, tokens, and interfaces
  * `@kurdel/runtime` defines **how** — actual orchestration and execution

* **SOLID architecture** — every package has a single, isolated responsibility

* **Explicit DI** — no reflection, no decorators, no magic

* **Scoped IoC** — each HTTP request gets its own dependency scope

* **Fully typed pipeline** — from `req` → `context` → `ActionResult` → `response`

* **No hidden coupling** — every dependency is declared and testable

---

## ⚙️ Layer Overview

| Layer                 | Package                                           | Example                                       | Description                     |
| --------------------- | ------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| **Common primitives** | `@kurdel/common`                                  | `HttpRequest`, `HttpResponse`                 | Shared low-level types          |
| **Contracts / API**   | `@kurdel/core`                                    | `Controller`, `MiddlewareRegistry`, `TOKENS`  | Framework interfaces            |
| **Runtime**           | `@kurdel/runtime`                                 | `RuntimeRouter`, `RuntimeRequestOrchestrator` | HTTP orchestration layer        |
| **Platform Adapters** | `@kurdel/runtime-node`, `@kurdel/runtime-express` | `NativeHttpServerAdapter`                     | Server bindings                 |
| **Templates**         | `@kurdel/template-ejs`                            | `EjsTemplateModule`                           | Server-side rendering           |
| **Facade**            | `@kurdel/facade`                                  | `createNodeApplication()`                     | Entry point for app bootstrap   |
| **IoC**               | `@kurdel/ioc`                                     | `createContainer()`                           | Dependency injection container  |
| **Database**          | `@kurdel/db`                                      | `Model`, `DbConnector`                        | Data access abstraction         |
| **Migrations**        | `@kurdel/migrations`                              | `MigrationRunner`                             | Schema migration management     |
| **CLI**               | `@kurdel/pirx`                                    | `pirx db:migrate`                             | Developer utilities and scripts |

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

> `@kurdel/facade` orchestrates dependencies, but contains no runtime logic.
> `@kurdel/common` remains dependency-free.

---

## 🚦 Runtime Flow

```
Request
├─► ServerAdapter.on(req, res)
├─► RuntimeRequestOrchestrator.execute()
├─► RuntimeRouter.resolve() → RouteMatch
├─► RuntimeHttpContextFactory.create()
│     ├─ req / res
│     ├─ url / query / params / body
│     ├─ route / schema
│     └─ result (mutable)
├─► MiddlewarePipes (pre → controller → post → final)
└─► ResponseRenderer.render()
```

---

### 🔍 **Key Components**

| Component                      | Responsibility                                                 |
| ------------------------------ | -------------------------------------------------------------- |
| **RuntimeRouter**              | Resolves `RouteMatch` from `method` + `path`                   |
| **RuntimeHttpContextFactory**  | Creates `HttpContext` per request (with route, result, schema) |
| **RuntimeMiddlewareRegistry**  | Stores global and scoped middleware by zone                    |
| **RuntimeMiddlewarePipe**      | Sequentially executes middlewares with correct priority        |
| **RuntimeControllerPipe**      | Executes controller middlewares and actions                    |
| **RuntimeRequestOrchestrator** | Coordinates full lifecycle and error handling                  |
| **ResponseRenderer**           | Converts `ActionResult` → HTTP output                          |

---

## 🧱 **Extended HttpContext**

The context now includes:

```ts
interface HttpContext<TBody, TParams, TReadable> {
  readonly req: HttpRequest;
  readonly res: HttpResponse;
  readonly url: URL;
  readonly query: Query;
  readonly params: TParams;
  readonly body?: TBody;

  /** The matched route metadata */
  readonly route?: RouteMatch;

  /** The latest computed ActionResult (populated at runtime) */
  result?: ActionResult<TReadable>;

  json(status: number, body: JsonValue): ActionResult<TReadable>;
  text(status: number, body: string): ActionResult<TReadable>;
  redirect(status: number, location: string): ActionResult<TReadable>;
  noContent(): ActionResult<TReadable>;
}
```

---

## 🧩 **Schemas and Validation**

Kurdel v3 introduces **route-level schemas** that describe request structure and enable automatic validation:

```ts
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
```

### Schema validation middleware

```ts
export const schemaValidator: Middleware = async (ctx, next) => {
  const schema = ctx.route?.schema;
  if (!schema) return next();

  try {
    if (schema.params) (ctx as any).params = await schema.params.validate(ctx.params);
    if (schema.query) (ctx as any).query = await schema.query.validate(ctx.query);
    if (schema.body) (ctx as any).body = await schema.body.validate(ctx.body);
  } catch (err) {
    if (err instanceof ValidationError) {
      return ctx.json(400, {
        error: 'Bad Request',
        message: err.message,
        field: err.field,
        details: err.details,
      });
    }
    throw err;
  }

  return next();
};
```

---

## 🧩 Validator Adapters

Adapters allow different validation libraries to integrate seamlessly.

### Example — Zod Adapter

```ts
import { ZodError, type ZodSchema } from 'zod';
import { createValidator } from '@kurdel/runtime/middlewares';
import { ValidationError } from '@kurdel/core/http';

export function zodAdapter<T>(schema: ZodSchema<T>) {
  return createValidator(
    data => schema.parse(data),
    err => {
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const details = err.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        }));
        return new ValidationError(first?.message ?? 'Invalid input', first?.path?.[0]?.toString(), details);
      }
      return null;
    },
  );
}
```

### Generic `createValidator`

```ts
export function createValidator<T>(
  parse: (data: unknown) => T | Promise<T>,
  mapError: (err: unknown) => ValidationError | null,
): SchemaValidator<T> {
  return {
    async validate(value: unknown): Promise<T> {
      try {
        return await parse(value);
      } catch (err) {
        const mapped = mapError(err);
        if (mapped) throw mapped;
        throw err;
      }
    },
  };
}
```

---

## ⚙️ Module Priorities

| Priority | Enum         | Module                                        | Purpose                         |
| -------- | ------------ | --------------------------------------------- | ------------------------------- |
| `10`     | `Lifecycle`  | `LifecycleModule`                             | Start/stop hooks                |
| `20`     | `Database`   | `DatabaseModule`                              | DB setup                        |
| `30`     | `User`       | Application modules                           | User logic                      |
| `40`     | `Model`      | `ModelModule`                                 | Model registration              |
| `50`     | `Middleware` | `MiddlewareModule`                            | Global middlewares              |
| `60`     | `Controller` | `ControllerModule`                            | Controller bindings             |
| `65`     | `Platform`   | `NodePlatformModule`, `ExpressPlatformModule` | Adapter + renderer              |
| `70`     | `Server`     | `ServerModule`                                | Connects adapter + orchestrator |

---

## 🧭 Runtime Layout

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

## ✅ Summary of the Refactor

* **Router** — pure route resolution only
* **Orchestrator** — central lifecycle control
* **MiddlewareRegistry** — unified global and scoped zones
* **HttpContext** — now holds `route`, `result`, and helpers
* **Schema validation** — fully pluggable via adapters
* **Tests** — cover full request orchestration
* **Runtime** — deterministic, platform-agnostic, testable

---

> **Result:**
> Kurdel’s runtime layer is now deterministic, composable, and validation-aware —
> enabling type-safe middleware, schema-based validation, and clean orchestration.

---

© 2025 Andrii Sorokin · MIT License
