# Contributing to kurdel

**kurdel** is a **TypeScript-first web framework** built on IoC and SOLID principles.  
To keep the architecture clean and predictable, please follow the conventions below.

---

## 🧱 Architecture Layers

The repository is a **monorepo** composed of multiple workspaces (packages):

| Package | Purpose |
|----------|----------|
| **@kurdel/common** | Shared primitives and HTTP types used across the framework. |
| **@kurdel/core** | Contracts, interfaces, tokens, base API definitions. |
| **@kurdel/runtime** | Core runtime implementation (router, modules, adapters, lifecycle). |
| **@kurdel/runtime-node** | Native Node.js HTTP server adapter. |
| **@kurdel/runtime-express** | Express runtime adapter. |
| **@kurdel/facade** | User-facing entry points (`createNodeApplication()`, helpers). |
| **@kurdel/ioc** | Standalone IoC container library used across all layers. |
| **@kurdel/db** | Database abstractions, connectors, and ORM utilities. |
| **@kurdel/migrations** | Migration engine and schema management tools. |
| **@kurdel/pirx** | Developer CLI for scaffolding, migrations, and utilities. |
| **samples/** | Example applications and integration demos. |

### Dependency direction

```

@kurdel/facade ─┬─► @kurdel/runtime-node / @kurdel/runtime-express
│               ├─► @kurdel/runtime
│               ├─► @kurdel/core
│               └─► @kurdel/ioc

@kurdel/runtime ─┬─► @kurdel/core
│                ├─► @kurdel/common
│                └─► @kurdel/ioc

@kurdel/core ───► @kurdel/common
@kurdel/db ─────► @kurdel/common
@kurdel/migrations ─► @kurdel/db
@kurdel/pirx ───► @kurdel/migrations

```

> The `facade` has no business logic — it composes runtime and core layers.  
> The `common` package sits at the base and has no dependencies.

---

## 📂 Code Style & Structure

All packages follow **ESM conventions**:

```json
{
  "type": "module",
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext"
  }
}
```

Each package structure:

```
src/
  http/      # HTTP runtime or adapters
  modules/   # IoC modules (runtime)
  app/       # Application composition
  cli/       # CLI commands (pirx)
index.ts     # Main export barrel
```

**Inside `@kurdel/runtime`:**

* Implementation classes of `@kurdel/core` contracts use the `Runtime*` prefix.
  Example: `RuntimeApplication`, `RuntimeRouter`
* Platform-specific classes use the `Native*` or `Express*` prefix.
  Example: `NativeHttpServerAdapter`, `ExpressServerAdapter`
* IoC modules (`ServerModule`, `LifecycleModule`, etc.) have **no prefix**.

---

## 🧩 Naming Conventions

| Type                    | Example                                           | Description                         |
| ----------------------- | ------------------------------------------------- | ----------------------------------- |
| Contract implementation | `RuntimeApplication`, `RuntimeRouter`             | Implements a `core` interface       |
| Platform adapter        | `NativeHttpServerAdapter`, `ExpressServerAdapter` | Relies on Node or Express APIs      |
| Framework module        | `ServerModule`, `LifecycleModule`                 | Registers bindings in IoC           |
| CLI tool                | `pirx generate`, `pirx db:migrate`                | Commands exposed via `@kurdel/pirx` |
| Tokens & interfaces     | `Application`, `ServerAdapter`, `TOKENS`          | Declared in `@kurdel/core`          |

---

## 🧪 Testing

All tests are written in **Vitest**.

* **Unit tests:** `tests/unit/**`
* **Integration tests:** `tests/integration/**` (use `supertest`)
* **E2E tests:** `tests/e2e/**` (use `createNodeApplication()` or `createExpressApplication()`)
* No real network listeners — use in-memory or stubbed adapters.

Run:

```bash
npm test
```

or for a specific package:

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

This monorepo uses **Lerna (powered by Nx)** for dependency-aware builds.

Build everything in order:

```bash
npx lerna run build
```

Build a specific package:

```bash
npm run build -w @kurdel/core
npm run build -w @kurdel/runtime
```

### Build conventions

* Each package must build **independently**.
* No direct cross-imports of `src/` between packages — always use public exports.
* Type paths are rewritten using **tsc-alias** after build.
* Compiled output goes to `lib/` for all packages.

---

## 🧭 Pull Requests

Before opening a PR:

1. ✅ Run **all tests** (`npm test`)
2. 🧱 Ensure **TypeScript builds cleanly** (`npm run build`)
3. 🧹 Format code using **Prettier** (`npm run format`)
4. 🧾 Document API changes in `README.md` or PR description
5. 🔍 Keep commits atomic and scoped logically

---

## 🤝 Tips for Contributors

* Use **absolute imports** (`src/...`) inside packages.
* Prefer **constructor injection** over property injection.
* IoC tokens and interfaces must live in `@kurdel/core`.
* Avoid introducing decorators — they are intentionally excluded.
* Runtime modules must remain composable and prefix-free.
* Do not leak runtime logic into facade or CLI packages.

---

## 🧭 Development Workflow

Typical development loop:

```bash
# Install dependencies
npm install

# Build all packages in dependency order
npx lerna run build

# Run tests
npm test

# Start a sample app
npm run dev -w @kurdel/sample-express
```

---

## 🪶 Notes

* Kurdel prioritizes **explicit composition** and **type safety**.
* Every feature is implemented as an **IoC-registered module**, not global state.
* Packages can be developed, built, and tested **in isolation**.
* The framework is designed for **predictability, transparency, and strong typing**.

---

© Andrii Sorokin · MIT License
