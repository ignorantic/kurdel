# Contributing to kurdel

**Kurdel** is a **TypeScript-first web framework** built on explicit IoC and SOLID principles.  
To keep the architecture clean, predictable, and type-safe, please follow the conventions below.

---

## 🧱 Architecture Layers

Kurdel is a **monorepo** of modular, independent workspaces:

| Package | Purpose |
|----------|----------|
| **@kurdel/common** | Shared primitives and base HTTP types. |
| **@kurdel/core** | Contracts, tokens, and public framework interfaces. |
| **@kurdel/runtime** | Core runtime: router, orchestrator, controllers, middleware, lifecycle. |
| **@kurdel/runtime-node** | Native Node.js HTTP adapter and renderer. |
| **@kurdel/runtime-express** | Express adapter and platform module. |
| **@kurdel/template-ejs** | EJS template engine integration (SSR). |
| **@kurdel/facade** | High-level entry points (`createNodeApplication`, etc.). |
| **@kurdel/ioc** | Standalone dependency-injection container. |
| **@kurdel/db** | Database abstractions and model base classes. |
| **@kurdel/migrations** | Migration engine and schema management. |
| **@kurdel/pirx** | Developer CLI (scaffolding, migrations, utilities). |
| **samples/** | Example applications and integration demos. |

> `@kurdel/facade` contains **no logic** — it only composes modules.  
> `@kurdel/common` sits at the base and has **zero dependencies**.

---

## 📂 Code Style & Structure

All packages use **TypeScript ≥ 5** and native **ES Modules**:

```json
{
  "type": "module",
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler"
  }
}
````

### Typical layout

```
src/
  app/         # Application composition and bootstrap
  http/        # Runtime HTTP orchestration (router, orchestrator, pipes)
  modules/     # IoC modules (server, controllers, lifecycle)
  cli/         # CLI commands (pirx)
index.ts       # Public barrel export
```

**Inside `@kurdel/runtime`:**

* Implementations of `@kurdel/core` contracts use the `Runtime*` prefix
  → `RuntimeApplication`, `RuntimeRouter`, `RuntimeRequestOrchestrator`
* Platform adapters use `Native*` or `Express*`
  → `NativeHttpServerAdapter`, `ExpressServerAdapter`
* IoC modules have **no prefix** (`ServerModule`, `LifecycleModule`, …)
* Template engines implement the `TemplateEngine` interface

---

## 🧩 Naming Conventions

| Type                    | Example                                               | Description                          |
| ----------------------- | ----------------------------------------------------- | ------------------------------------ |
| Contract implementation | `RuntimeRouter`, `RuntimeRequestOrchestrator`         | Implements `@kurdel/core` interfaces |
| Platform adapter        | `NativeHttpServerAdapter`, `ExpressServerAdapter`     | Binds runtime to Node/Express        |
| Framework module        | `ServerModule`, `LifecycleModule`, `ControllerModule` | IoC composition modules              |
| Template engine         | `EjsTemplateModule`                                   | Provides SSR via `TemplateEngine`    |
| CLI / tooling           | `pirx db:migrate`                                     | Commands in `@kurdel/pirx`           |
| Token / interface       | `Application`, `ServerAdapter`, `TOKENS`              | Declared in `@kurdel/core`           |

---

## 🧪 Testing

All tests use **Vitest** and run fully in-process.

| Type            | Location               | Description                             |
| --------------- | ---------------------- | --------------------------------------- |
| **Unit**        | `tests/unit/**`        | Small-scope logic (IoC, routing, pipes) |
| **Integration** | `tests/integration/**` | Runtime + orchestrator + adapter flow   |
| **E2E**         | `tests/e2e/**`         | Real HTTP adapters (Node / Express)     |

Guidelines:

* ✅ Use in-memory or stubbed adapters (no real ports).
* ✅ Prefer local fakes (`FakeController`, `FakeResolver`).
* ✅ Keep tests deterministic and quiet (no logs).

Run all tests:

```bash
npm test
```

Run for one package:

```bash
npm run test -w @kurdel/runtime
```

---

## 🧱 Commits

Follow **[Conventional Commits](https://www.conventionalcommits.org/)**:

| Type       | Example                                            | Purpose         |
| ---------- | -------------------------------------------------- | --------------- |
| `feat`     | `feat(runtime): add orchestrator error handling`   | New feature     |
| `fix`      | `fix(core): correct HttpContext typings`           | Bug fix         |
| `refactor` | `refactor(runtime): split router and orchestrator` | Internal change |
| `test`     | `test(runtime): add integration coverage`          | Test-related    |
| `docs`     | `docs(contributing): update workflow section`      | Documentation   |
| `chore`    | `chore(build): update tsconfig paths`              | Maintenance     |

---

## 🧰 Build & Workspace Commands

Kurdel uses **Lerna + Nx** for dependency-aware builds.

Build everything:

```bash
npx lerna run build
```

Build one package:

```bash
npm run build -w @kurdel/core
npm run build -w @kurdel/runtime
```

### Build Rules

* Each package **must build independently**.
* No `src/` cross-imports between packages — use public exports.
* Type paths are rewritten via **tsc-alias**.
* Compiled output always goes to `/lib`.

---

## 🧭 Pull Requests

Before submitting:

1. ✅ Run all tests (`npm test`)
2. 🧱 Build passes (`npm run build`)
3. 🧹 Code formatted (`npm run format`)
4. 🧾 API docs or changelog updated
5. 🔍 Commits are small and scoped

---

## 🤝 Development Tips

* Use **absolute imports** (`src/...`) inside packages.
* Prefer **constructor injection**.
* All IoC tokens/interfaces live in `@kurdel/core`.
* No decorators — injection must be explicit.
* Runtime modules stay **prefix-free** and composable.
* Don’t leak runtime logic into `@kurdel/facade` or `@kurdel/pirx`.
* Template engines implement `TemplateEngine` and register via IoC.
* Global middlewares are now owned by `ServerModule`, not `Router`.

---

## 🧭 Development Workflow

```bash
# Install dependencies
npm install

# Build all packages
npx lerna run build

# Run tests
npm test

# Start a sample app (e.g. EJS or React)
npm run dev -w @kurdel/sample-ejs
```

---

## 🪶 Notes

* Kurdel favors **explicit composition**, **predictability**, and **type safety**.
* Each feature is a self-contained **IoC module**, not global state.
* Packages are buildable and testable **in isolation**.
* The new `RuntimeRequestOrchestrator` coordinates routing, middleware, controller, and rendering.
* `RuntimeRouter` is now pure and resolves routes only.
* Future adapters: **Bun**, **Edge**, **Deno**, **Cloudflare Workers**.

---

© Andrii Sorokin · MIT License
