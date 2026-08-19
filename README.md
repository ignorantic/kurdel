# **kurdel**

[![CI](https://github.com/ignorantic/kurdel/actions/workflows/ci.yml/badge.svg)](https://github.com/ignorantic/kurdel/actions/workflows/ci.yml)

A modular **TypeScript-first** web framework built on **explicit composition**, **contract-driven architecture**, and **request-scoped dependency injection**.

No decorators. No reflection. No hidden runtime behavior.

> **Beta:** APIs may change before `1.0.0`. Install packages using the `beta`
> dist-tag and review the changelog before upgrading.

---

## Philosophy

Kurdel favors explicit composition over framework magic.

Applications are assembled from small modules connected through dependency
injection and public contracts. Business services remain transport-independent,
while the runtime coordinates routing, middleware, rendering, validation,
authentication, and application lifecycle.

Core architectural principles:

- explicit composition
- contract-driven design
- request-scoped dependency injection
- deterministic runtime execution
- transport-independent services
- single ownership of responsibilities

---

## Package Overview

Kurdel is a modular monorepo. Every package owns a single architectural concern.

| Package | Responsibility |
|---------|----------------|
| **`@kurdel/common`** | Shared primitives and low-level types |
| **`@kurdel/core`** | Framework contracts, tokens, and public interfaces |
| **`@kurdel/runtime`** | Routing, middleware pipeline, orchestration |
| **`@kurdel/runtime-node`** | Native Node.js adapter |
| **`@kurdel/runtime-express`** | Express adapter |
| **`@kurdel/template-ejs`** | EJS server-side rendering |
| **`@kurdel/template-react`** | React server-side rendering |
| **`@kurdel/auth`** | Authentication and authorization infrastructure |
| **`@kurdel/auth-db`** | Database-backed authentication adapters |
| **`@kurdel/db`** | Database abstraction |
| **`@kurdel/migrations`** | Schema evolution |
| **`@kurdel/ioc`** | Dependency injection container |
| **`@kurdel/facade`** | Application bootstrap |
| **`@kurdel/pirx`** | CLI and developer tooling |

Dependency direction:

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

Additional packages (`auth`, `db`, `migrations`, `template-*`, `ioc`) extend the
framework vertically while preserving the same dependency principles.

For a complete architectural overview, see
[ARCHITECTURE.md](ARCHITECTURE.md).

---

## Features

- 🧩 Explicit module composition
- 🧠 Constructor-based dependency injection
- 🧾 Route-level schema validation
- 🔄 Deterministic middleware pipeline
- 🔒 Storage-agnostic authentication
- 🗄 Database abstraction with SQLite and PostgreSQL adapters
- 🎨 Server-side rendering (EJS and React)
- 🧪 In-memory integration testing
- 🛠 Modular CLI tooling

---

## Installation

```bash
npm install \
  @kurdel/facade@beta \
  @kurdel/runtime@beta \
  @kurdel/core@beta \
  @kurdel/common@beta \
  @kurdel/ioc@beta
```

Requires:

- Node.js **20.19+**, **22.12+**, or **24+**
- TypeScript **5+**

Example `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext"
  },
  "type": "module"
}
```

---

## Quick Start

```ts
import { createNodeApplication } from '@kurdel/facade';
import { Controller, Ok, route, type HttpContext } from '@kurdel/core/http';

class HelloController extends Controller {
  readonly routes = {
    hello: route({
      method: 'GET',
      path: '/hello',
    })(this.hello),
  };

  async hello(_ctx: HttpContext) {
    return Ok({
      message: 'Hello, Kurdel!',
    });
  }
}

const HelloModule = {
  controllers: [{ use: HelloController }],
};

const app = await createNodeApplication({
  modules: [HelloModule],
});

app.listen(3000);
```

---

## Core Building Blocks

Applications are composed from a small set of architectural building blocks.

```
Application
      │
      ▼
Module
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
```

### Modules

Modules compose the application.

They register:

- controllers
- providers
- middleware
- lifecycle hooks

Modules contain composition logic rather than business logic.

---

### Controllers

Controllers declare routes and coordinate request handling.

```ts
export class UserController extends Controller {
  readonly routes = {
    list: route({
      method: 'GET',
      path: '/users',
    })(this.list),
  };

  async list() {
    return Ok([]);
  }
}
```

---

### Services

Services implement application workflows.

They remain transport-independent and never manipulate HTTP directly.

Typical responsibilities include:

- validation
- transactions
- coordination of multiple repositories

---

### Repositories

Repositories expose persisted state.

They load and store data but do not coordinate business workflows.

---

## Validation

Routes may declare schemas describing request data.

```ts
readonly routes = {
  create: route({
    method: 'POST',
    path: '/',
    schema: {
      body: zodAdapter(schema),
    },
  })(this.create),
};
```

Validation is performed automatically by the runtime.

Validator libraries integrate through small adapters.

Current examples include:

- Zod

Additional adapters (Yup, AJV, etc.) can be added independently.

---

## Request Pipeline

Every request follows the same execution pipeline.

```
resolve
    ↓
validate
    ↓
pre
    ↓
controller
    ↓
render
    ↓
post
    ↓
error
    ↓
final
```

This deterministic execution model keeps middleware predictable and simplifies
testing.

---

## Template Engines

Kurdel currently provides:

- `@kurdel/template-ejs`
- `@kurdel/template-react`

Both integrate through the same rendering abstractions.

---

## Testing

Kurdel is designed for deterministic in-process testing.

Typical integration tests use:

- `createNodeApplication()`
- `supertest`
- fake or in-memory dependencies

No external infrastructure is required for most tests.

---

## Documentation

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Releasing:** [RELEASING.md](RELEASING.md)

Each package also contains its own README with package-specific documentation.

---

## Roadmap

- Bun runtime adapter
- Deno runtime adapter
- Cloudflare Workers adapter
- Additional validation adapters
- Extended CLI tooling
- Runtime visualization tools

---

© 2025–2026 Andrii Sorokin · [MIT License](LICENSE)