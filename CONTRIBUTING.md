# Contributing to **kurdel**

**Kurdel** is a **TypeScript-first modular web framework** built on explicit IoC, SOLID design, and deterministic runtime composition.
This document outlines the conventions and rules for contributing new features or improvements.

---

## 🧱 Architecture Layers

Kurdel is a **monorepo** of cohesive, self-contained workspaces:

| Package                     | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| **@kurdel/common**          | Shared primitives and HTTP abstractions.                   |
| **@kurdel/core**            | Public contracts, tokens, and framework interfaces.        |
| **@kurdel/runtime**         | Core runtime: router, orchestrator, middleware, lifecycle. |
| **@kurdel/runtime-node**    | Native Node.js HTTP adapter and renderer.                  |
| **@kurdel/runtime-express** | Express-based platform adapter.                            |
| **@kurdel/template-ejs**    | EJS template engine integration (SSR).                     |
| **@kurdel/template-react**  | React template engine integration (SSR  + JSX rendering).  |
| **@kurdel/facade**          | Public entry points (`createNodeApplication`, etc.).       |
| **@kurdel/ioc**             | Lightweight dependency-injection container.                |
| **@kurdel/db**              | Database abstractions and connectors.                      |
| **@kurdel/migrations**      | Migration and schema management layer.                     |
| **@kurdel/pirx**            | Developer CLI (scaffolding, migrations, utilities).        |
| **sample/**                 | Integration examples and demo apps.                        |

> `@kurdel/facade` contains **no runtime logic** — it only orchestrates composition.
> `@kurdel/common` sits at the base and has **zero dependencies**.

### Dependency direction

Dependencies always point toward lower architectural layers.

```
common
   ↓
core
   ↓
runtime
   ↓
runtime-node / runtime-express
   ↓
facade
```

Lower layers must never depend on higher layers.

Packages communicate through public contracts rather than implementation details.

---

## 🧩 Architectural Rules

* **Explicit Composition:** no decorators, no reflection.
* **Type-First Contracts:** `@kurdel/core` defines *what*, `@kurdel/runtime` defines *how*.
* **Scoped IoC:** each HTTP request gets its own container scope.
* **Zero Hidden Coupling:** all runtime dependencies are declared.
* **Extensible Runtime:** adapters and modules can be swapped freely.
* **Transport Independence:** business services never depend on HTTP-specific abstractions.

---

## 📂 Code Style & Structure

All packages use **TypeScript ≥ 5.0** and **ES Modules**:

```json
{
  "type": "module",
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler"
  }
}
```

**TypeScript conventions:**

* Use named exports only.
* Avoid default exports.
* Use `import type` for type-only imports.
* Use explicit `.js` extensions for local imports.
* Public APIs should declare explicit return types.
* Prefer `unknown` over `any`.
* Prefer interfaces for public contracts.

**Naming conventions:**

| Category                | Example                                           | Notes                               |
| ----------------------- | ------------------------------------------------- | ----------------------------------- |
| Contract implementation | `RuntimeRouter`, `RuntimeRequestOrchestrator`     | Implements `@kurdel/core` contracts |
| Framework module        | `ServerModule`, `LifecycleModule`                 | IoC-level composition               |
| Template engine         | `EjsTemplateModule`                               | SSR via `TemplateEngine`            |
| CLI                     | `pirx migrate run`                                | Developer tooling                   |
| Validation adapter      | `zodAdapter`, `createValidator`                   | Schema-level validation             |
| Middleware              | `schemaValidator`, `loggingMiddleware`            | Executed by middleware pipe         |
| Repository              | `DatabaseAuthUserRepository`                      |                                     |
| Service                 | `DatabaseUserService`                             |                                     |
| Registry                | `AuthStrategyRegistry`                            |                                     |
| Schema adapter          | `zodAdapter`, `yupAdapter`                        | Validation library integration      |

---

## 📖 Documentation

Public APIs should be self-documenting through consistent JSDoc.

### Public classes

Every exported class begins with a short architectural description.

```ts
/**
 * ## DatabaseUserService
 *
 * ...
 */
export class DatabaseUserService {}
```

The documentation should describe:

- responsibilities
- guarantees
- non-responsibilities (when useful)

Focus on architectural intent rather than implementation details.

Documentation should explain why a component exists before describing how it works.

### Public methods

Document:

- purpose
- parameters when clarification is useful
- observable behavior
- invariants

Avoid documenting obvious implementation details.

### Internal organization

Large classes may group methods by responsibility using section separators:

```ts
// ---------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------
```

Large public classes should organize methods by responsibility rather than by visibility.

Typical sections include:

- User management
- Validation
- Persistence
- Mapping
- Error translation
- Utilities

---

## 🧪 Testing

Tests use **Vitest**, run **in-process**, and cover unit → integration → E2E.

| Type            | Location               | Focus                          |
| --------------- | ---------------------- | ------------------------------ |
| **Unit**        | `tests/unit/**`        | Core logic, IoC, and pipes     |
| **Integration** | `tests/integration/**` | Router + orchestrator flow     |
| **E2E**         | `tests/e2e/**`         | Real adapters (Node / Express) |

Guidelines:

* ✅ Use **fake adapters** or in-memory mocks — no open ports.
* ✅ Keep tests deterministic and isolated.
* ✅ No console output in CI.
* ✅ Prefer **schema-based** validation tests instead of manual field checks.

Example:

```bash
npm run test -w @kurdel/runtime
```

### Test structure

Prefer one observable behavior per test.

Use descriptive names.

Avoid multi-stage "kitchen sink" tests.

Reusable fakes belong under `tests/utils`.

Prefer deterministic in-memory tests over external services whenever possible.

---

## 🧱 Commits

Follow **[Conventional Commits](https://www.conventionalcommits.org/)**.

| Type       | Example                                              | Purpose           |
| ---------- | ---------------------------------------------------- | ----------------- |
| `feat`     | `feat(runtime): add schema validation middleware`    | New feature       |
| `fix`      | `fix(core): correct HttpContext typings`             | Bug fix           |
| `refactor` | `refactor(runtime): extract MiddlewareRegistry`      | Structural change |
| `test`     | `test(facade): cover application bootstrap`          | Testing           |
| `docs`     | `docs(contributing): update schema validation rules` | Documentation     |
| `chore`    | `chore(repo): update tsconfig paths`                 | Maintenance       |

Non-trivial commits must include a bullet-list body:

```text
refactor(auth): separate credentials from user identities

- introduce AuthUserRepository as the source of current user roles
- split credentials from authorization data
- update tests and samples
```

Commit message rules:

* Use lowercase imperative wording.
* Separate the subject and body with a blank line.
* Start every body item with `- `.
* Describe logical changes rather than individual files.
* Use package or subsystem names as scopes.
* Omit the body only for genuinely trivial commits.
* Inspect recent commits before composing a message.

---

## 🧰 Build & Workspace Rules

Kurdel uses **Lerna + Nx** for dependency-aware builds.

Build all:

```bash
npx lerna run build
```

Build single package:

```bash
npm run build -w @kurdel/core
```

**Rules:**

* Every package must build **independently**.
* No cross-imports from other packages’ `src/`.
* Use public exports only.
* Output goes to `/lib`.
* Type aliases rewritten via **tsc-alias**.

---

## 🧭 Pull Request Checklist

Before submitting:

1. ✅ All tests pass (`npm test`)
2. 🔧 Builds succeed (`npm run build`)
3. 🧹 Code formatted and linted
4. 🧾 API docs or changelog updated if relevant
5. 🧩 Commits are small and descriptive
6. 📘 New runtime components are covered by tests

---

## 🤝 Development Guidelines

* Use **constructor injection** only — no decorators.
* Register **all providers** via `AppModule.providers`.
* Global middlewares belong to `ServerModule`, not `Router`.
* Validation runs automatically via route schemas (`RouteSchema`).
* Middleware zones: `pre`, `controller`, `post`, `final`.
* Keep the runtime **platform-agnostic** — adapters live in `@kurdel/runtime-node` or `@kurdel/runtime-express`.
* **Adapters** and **validators** must be optional peer dependencies.
* **Database** access is abstracted via `Database` token.
* Prefer composition over inheritance.
* Keep classes focused on a single responsibility.
* Do not import implementation details from sibling packages.
* Avoid hidden runtime behavior.
* Keep services transport-agnostic.

---

## 🧩 Validation & Schemas

Runtime now supports **route-level schemas** and **library adapters** (Zod, Yup, AJV, etc.):

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

Adapters use the generic `createValidator(parse, mapError)` helper:

```ts
import { ZodError, type ZodSchema } from 'zod';
import { createValidator } from '@kurdel/runtime/middlewares';

export const zodAdapter = <T>(schema: ZodSchema<T>) =>
  createValidator(
    data => schema.parse(data),
    err => err instanceof ZodError
      ? new ValidationError(err.issues[0]?.message ?? 'Invalid', undefined, err.issues)
      : null,
  );
```

---

## 🧭 Developer Workflow

```bash
# Install the locked dependency graph
npm ci

# Build everything
npx lerna run build

# Run all tests
npm test

# Run single workspace
npm run dev -w @kurdel/sample-sqlite
```

---

## 🪶 Notes

* Kurdel prioritizes **explicit composition**, **predictability**, and **type safety**.
* Each feature is an isolated **IoC module**, not global state.
* Runtime logic is **pure** and **deterministic** — no side effects.
* `RuntimeRequestOrchestrator` coordinates routing, middleware, and controller execution.
* `RuntimeRouter` now resolves routes only.
* Validation is handled via pluggable schema adapters.
* Future adapters: **Bun**, **Edge**, **Deno**, **Cloudflare Workers**.

---

© 2025–2026 Andrii Sorokin · [MIT License](LICENSE)
