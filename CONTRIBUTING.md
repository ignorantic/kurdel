# Contributing to kurdel

kurdel is a **TypeScript-first web framework** built on IoC and SOLID principles.  
To keep the architecture clean and predictable, please follow the conventions below.

---

## 🧱 Architecture layers

The repository is a **monorepo** composed of several workspaces:

| Package | Purpose |
|----------|----------|
| **@kurdel/core** | Contracts, interfaces, tokens, base types (`api/`) |
| **@kurdel/runtime** | Executable implementation (modules, adapters, composition) |
| **@kurdel/facade** | User-facing entry points (e.g. `createApplication()`) |
| **@kurdel/ioc** | Standalone IoC container library |
| **sample/** | Example applications |

---

## 📂 Code style & structure

Each package follows ESM conventions (`"type": "module"`, `moduleResolution: "nodenext"`).

```
src/
api/       # Public contracts and tokens
runtime/   # Implementations of the contracts
facade/    # Public entry points
index.ts   # Main export barrel

```

Inside `@kurdel/runtime`:
- Classes implementing `@kurdel/core` contracts use the **`Runtime*`** prefix.  
  Example: `RuntimeApplication`, `RuntimeRouter`.
- Platform-specific classes (e.g. Node) use the **`Native*`** prefix.  
  Example: `NativeHttpServerAdapter`.
- Framework modules (`ServerModule`, `ControllerModule`, etc.) **have no prefix**.

---

## 🧩 Naming conventions

| Type | Example | Notes |
|------|----------|-------|
| Contract implementation | `RuntimeApplication`, `RuntimeRouter` | Implements an interface from `core/api` |
| Platform adapter | `NativeHttpServerAdapter` | Relies on Node or other platform APIs |
| DI / infrastructure module | `ServerModule`, `LifecycleModule` | Configures bindings inside IoC |
| Tokens & interfaces | `Application`, `ServerAdapter`, `TOKENS` | Declared in `@kurdel/core` |

---

## 🧪 Testing

- Unit tests: `tests/unit/...`
- Integration tests: `tests/integration/...` (using `supertest`)
- All tests must run **without real network listeners** if possible (via in-memory adapters).

Run:

```bash
npm run test -w @kurdel/runtime
```

---

## 🧱 Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

| Type       | Example                                       | Description             |
| ---------- | --------------------------------------------- | ----------------------- |
| `feat`     | `feat(http): add streaming response helper`   | New feature             |
| `fix`      | `fix(router): preserve query params order`    | Bug fix                 |
| `refactor` | `refactor(runtime): rename *Impl to Runtime*` | Internal refactor       |
| `test`     | `test(core): add lifecycle hook coverage`     | Added or improved tests |
| `docs`     | `docs(readme): update installation section`   | Documentation change    |

---

## 🧹 Build & workspace commands

```bash
npm run build -w @kurdel/core
npm run build -w @kurdel/runtime
npm run build -w @kurdel/facade
```

Each package must build **independently** without cross-imports of `src/` code.

---

## 🧭 Pull requests

Before opening a PR:

* Ensure **all tests pass** (`npm run test`).
* Ensure **TypeScript builds cleanly** (`tsc -p tsconfig.build.json`).
* Document any API changes in either `README.md` or the PR body.
