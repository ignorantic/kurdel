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
| **@kurdel/runtime** | Executable runtime implementation (router, modules, adapters, lifecycle). |
| **@kurdel/facade** | User-facing entry points (`createApplication()`, helpers). |
| **@kurdel/ioc** | Standalone IoC container library used across all layers. |
| **@kurdel/db** | Database abstractions, connectors, and ORM utilities. |
| **@kurdel/migrations** | Migration engine and command-line tools. |
| **@kurdel/pirx** | Developer CLI for scaffolding, migrations, and utilities. |
| **samples/** | Example applications and integration demos. |

### Dependency direction

```

@kurdel/facade ─┬─► @kurdel/runtime
├─► @kurdel/core
└─► @kurdel/ioc

@kurdel/runtime ─┬─► @kurdel/core
├─► @kurdel/common
└─► @kurdel/ioc

@kurdel/core ───► @kurdel/common
@kurdel/db ─────► @kurdel/core
@kurdel/migrations ─► @kurdel/db
@kurdel/pirx ───► @kurdel/runtime + @kurdel/migrations

```

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
  api/       # Contracts and tokens (in core)
  http/      # HTTP runtime or adapters
  modules/   # IoC modules (runtime)
  app/       # Application composition
  cli/       # CLI commands (pirx)
index.ts     # Main export barrel
```

**Inside `@kurdel/runtime`:**

* Implementation classes of `@kurdel/core` contracts use the `Runtime*` prefix.
  Example: `RuntimeApplication`, `RuntimeRouter`
* Platform-specific classes use the `Native*` prefix.
  Example: `NativeHttpServerAdapter`
* Modules (`ServerModule`, `LifecycleModule`, etc.) **have no prefix**.

---

## 🧩 Naming Conventions

| Type                    | Example                                  | Description                         |
| ----------------------- | ---------------------------------------- | ----------------------------------- |
| Contract implementation | `RuntimeApplication`, `RuntimeRouter`    | Implements a `core` interface       |
| Platform adapter        | `NativeHttpServerAdapter`                | Relies on Node or platform APIs     |
| Framework module        | `ServerModule`, `LifecycleModule`        | Registers bindings in IoC           |
| CLI tool                | `pirx generate`, `pirx db:migrate`       | Commands exposed via `@kurdel/pirx` |
| Tokens & interfaces     | `Application`, `ServerAdapter`, `TOKENS` | Declared in `@kurdel/core`          |

---

## 🧪 Testing

All tests are written in **Vitest**.

* Unit tests live under `tests/unit/...`
* Integration tests use `supertest` and live under `tests/integration/...`
* No real network listeners — prefer in-memory or stubbed adapters.

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

| Type       | Example                                          | Description                |
| ---------- | ------------------------------------------------ | -------------------------- |
| `feat`     | `feat(http): add streaming response helper`      | New feature                |
| `fix`      | `fix(router): preserve query params order`       | Bug fix                    |
| `refactor` | `refactor(runtime): extract controller resolver` | Internal refactor          |
| `test`     | `test(core): add lifecycle hook coverage`        | Tests added or improved    |
| `docs`     | `docs(readme): update installation section`      | Documentation change       |
| `chore`    | `chore(build): bump Lerna config`                | Non-functional maintenance |

---

## 🧰 Build & Workspace Commands

This monorepo uses **Lerna (powered by Nx)** for dependency-aware builds.

Build everything in order:

```bash
npx lerna run build
```

or a specific package:

```bash
npm run build -w @kurdel/core
npm run build -w @kurdel/runtime
```

### Build conventions

* Each package must build **independently**.
* No direct cross-imports of `src/` files between packages — always use published entry points.
* Type declarations are resolved via `tsc-alias` after build.
* Build output must go to `lib/` for all packages.

---

## 🧭 Pull Requests

Before opening a PR:

1. ✅ Run **all tests** (`npm test`)
2. 🧱 Ensure **TypeScript builds cleanly** (`npm run build`)
3. 🧹 Format code using **Prettier** (`npm run format`)
4. 🧾 Document any API changes in `README.md` or the PR body
5. 🔍 Keep commits atomic and well-scoped

---

## 🤝 Tips for Contributors

* Use **absolute imports with `src/` prefix** within each package.
* Prefer **constructor injection** over property assignment.
* All IoC tokens must live in `@kurdel/core`, never in runtime.
* Avoid introducing decorators — they are intentionally excluded from design.
* Keep runtime modules composable and prefix-free.

---

## 🧭 Development Workflow

Typical inner loop:

```bash
# install deps
npm install

# build all
npx lerna run build

# run tests
npm test

# run a sample app
npm run dev -w simple-app
```

---

## 🪶 Notes

* Kurdel’s architecture prioritizes **stability and transparency** over magic.
* Everything is **typed, explicit, and dependency-injected**.
* All internal packages can be developed and tested in isolation.

---

© Andrii Sorokin · MIT License
