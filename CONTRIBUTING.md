# Contributing to kurdel

**Kurdel** is a **TypeScript-first web framework** built on IoC and SOLID principles.  
To keep the architecture clean, predictable, and type-safe, please follow the conventions below.

---

## 🧱 Architecture Layers

Kurdel is a **monorepo** composed of modular, independent workspaces (packages):

| Package | Purpose |
|----------|----------|
| **@kurdel/common** | Shared primitives and HTTP types used across the framework. |
| **@kurdel/core** | Contracts, interfaces, tokens, and base API definitions. |
| **@kurdel/runtime** | Core runtime implementation (router, controllers, middlewares, lifecycle). |
| **@kurdel/runtime-node** | Native Node.js HTTP server adapter. |
| **@kurdel/runtime-express** | Express runtime adapter. |
| **@kurdel/template-ejs** | EJS template engine integration (server-side rendering). |
| **@kurdel/facade** | User-facing entry points (`createNodeApplication()`, etc.). |
| **@kurdel/ioc** | Standalone IoC container used across all layers. |
| **@kurdel/db** | Database abstractions, connectors, and model base classes. |
| **@kurdel/migrations** | Migration engine and schema management tools. |
| **@kurdel/pirx** | Developer CLI for scaffolding, migrations, and utilities. |
| **samples/** | Example applications and integration demos. |

---

### Dependency Direction

```

@kurdel/facade ─┬─► @kurdel/runtime-node / @kurdel/runtime-express
│               ├─► @kurdel/runtime
│               ├─► @kurdel/core
│               ├─► @kurdel/template-ejs
│               └─► @kurdel/ioc

@kurdel/runtime ─┬─► @kurdel/core
│                ├─► @kurdel/common
│                └─► @kurdel/ioc

@kurdel/core ───► @kurdel/common
@kurdel/db ─────► @kurdel/common
@kurdel/migrations ─► @kurdel/db
@kurdel/pirx ───► @kurdel/migrations

```

> The `facade` package contains no business logic — it only composes runtimes and modules.  
> The `common` package sits at the base and has **zero dependencies**.

---

## 📂 Code Style & Structure

All packages use **ES Modules** and TypeScript ≥ 5.

```json
{
  "type": "module",
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext"
  }
}
```

### Typical package layout

```
src/
  http/        # HTTP runtime, adapters, or controller logic
  modules/     # IoC modules (runtime)
  app/         # Application composition and bootstrap
  cli/         # CLI commands (pirx)
index.ts       # Public barrel export
```

**Inside `@kurdel/runtime`:**

* Implementation classes of `@kurdel/core` contracts use the `Runtime*` prefix.
  → e.g. `RuntimeApplication`, `RuntimeRouter`
* Platform-specific adapters use `Native*` or `Express*`.
  → e.g. `NativeHttpServerAdapter`, `ExpressServerAdapter`
* IoC modules have **no prefix** (e.g. `ServerModule`, `LifecycleModule`).
* Template engines implement the shared `TemplateEngine` contract.

---

## 🧩 Naming Conventions

| Type                    | Example                                           | Description                           |
| ----------------------- | ------------------------------------------------- | ------------------------------------- |
| Contract implementation | `RuntimeApplication`, `RuntimeRouter`             | Implements a `@kurdel/core` interface |
| Platform adapter        | `NativeHttpServerAdapter`, `ExpressServerAdapter` | Binds framework to a platform runtime |
| Template engine         | `EjsTemplateModule`                               | Implements `TemplateEngine` for SSR   |
| Framework module        | `ServerModule`, `LifecycleModule`                 | Registers bindings in IoC             |
| CLI tool                | `pirx generate`, `pirx db:migrate`                | Commands provided by `@kurdel/pirx`   |
| Token / Interface       | `Application`, `ServerAdapter`, `TOKENS`          | Defined in `@kurdel/core`             |

---

## 🧪 Testing

All tests are written using **Vitest** and run in-process.

| Type            | Location               | Description                                          |
| --------------- | ---------------------- | ---------------------------------------------------- |
| **Unit**        | `tests/unit/**`        | Pure logic tests (IoC, routing, etc.)                |
| **Integration** | `tests/integration/**` | Uses `supertest` and `createNodeApplication()`       |
| **E2E**         | `tests/e2e/**`         | Validates behavior with real adapters (Node/Express) |

Guidelines:

* No real network listeners — always use in-memory or stubbed adapters.
* Avoid cross-package mocks; prefer test-local fakes.
* Keep test output deterministic (no console logs).

Run all tests:

```bash
npm test
```

Run for a specific package:

```bash
npm run test -w @kurdel/runtime
```

---

## 🧱 Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

| Type       | Example                                           | Description                |
| ---------- | ------------------------------------------------- | -------------------------- |
| `feat`     | `feat(router): add middleware chain timing`       | New feature                |
| `fix`      | `fix(core): correct HttpContext typing`           | Bug fix                    |
| `refactor` | `refactor(runtime): simplify controller resolver` | Internal refactor          |
| `test`     | `test(facade): add E2E startup coverage`          | Tests added or improved    |
| `docs`     | `docs(architecture): update dependency graph`     | Documentation change       |
| `chore`    | `chore(build): update Nx configuration`           | Non-functional maintenance |

---

## 🧰 Build & Workspace Commands

Kurdel uses **Lerna (powered by Nx)** for dependency-aware builds.

Build everything:

```bash
npx lerna run build
```

Build a specific package:

```bash
npm run build -w @kurdel/core
npm run build -w @kurdel/runtime
```

### Build Conventions

* Each package **must build independently**.
* No direct cross-imports of `src/` between packages — always use public exports.
* Type paths are rewritten via **tsc-alias** after compilation.
* All compiled outputs go to `/lib`.

---

## 🧭 Pull Requests

Before opening a PR:

1. ✅ Run all tests — `npm test`
2. 🧱 Ensure TypeScript builds cleanly — `npm run build`
3. 🧹 Format code — `npm run format`
4. 🧾 Document API changes (README or PR description)
5. 🔍 Keep commits atomic and logically scoped

---

## 🤝 Tips for Contributors

* Use **absolute imports** (`src/...`) within packages.
* Prefer **constructor injection** over property injection.
* IoC tokens and interfaces always belong to `@kurdel/core`.
* Avoid decorators — the design is intentionally explicit.
* Runtime modules must remain **prefix-free** and composable.
* Do not leak runtime or template logic into `@kurdel/facade` or `@kurdel/pirx`.
* Template engines should implement `TemplateEngine` and register via IoC.

---

## 🧭 Development Workflow

Typical loop:

```bash
# Install dependencies
npm install

# Build all packages
npx lerna run build

# Run tests
npm test

# Start a sample app
npm run dev -w @kurdel/sample-ejs
```

---

## 🪶 Notes

* Kurdel prioritizes **explicit composition**, **predictability**, and **type safety**.
* Every feature is implemented as an **IoC-registered module**, not global state.
* Packages can be developed, built, and tested **in isolation**.
* Template engines (like EJS) are optional runtime extensions.
* Future integrations: Handlebars, Mustache, and SSR caching modules.

---

© Andrii Sorokin · MIT License
