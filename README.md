# kurdel

A tiny **TypeScript-first** web framework built on SOLID + IoC.
Clear boundaries, no decorators, explicit modules and providers, typed results.

* **API vs Runtime vs Facade**: public **contracts** live in `api/`, implementations in `runtime/`, and a few entry points in `facade/`.
* **IoC by contract**: depends on `@kurdel/ioc/api` interfaces; default container comes from `@kurdel/ioc`.
* **No decorators**: routes and middleware are declared explicitly (helpers, not magic).
* **Testable by design**: `Application.listen()` returns a *RunningServer* handle (`close()`, `raw()`).

---

## Install

```bash
npm i @kurdel/core @kurdel/ioc
```

> Node ≥ 18, TypeScript ≥ 5. `type: "module"` recommended.

---

## Quick start

```ts
// app.ts
import { createApplication, Ok, route, Controller } from '@kurdel/core';

class HelloController extends Controller {
  @route({ method: 'GET', path: '/hello' })
  async hello() {
    return Ok({ message: 'Hello, kurdel!' });
  }
}

class HelloModule {
  // HttpModule contract (no decorators required)
  readonly controllers = [{ use: HelloController, deps: {} }];
}

const app = await createApplication({ modules: [new HelloModule()] });
const server = app.listen(3000, () => console.log('http://localhost:3000'));
```

---

## Concepts

### Application (API)

Public contract exposing just what you need:

* `use(...modules)` – add modules before startup.
* `listen(port)` → `RunningServer` – returns `{ url?, close(), raw?() }`.

### Modules

Encapsulate features and their declarations:

```ts
import type { HttpModule, AppConfig } from '@kurdel/core';

export class UserModule implements HttpModule<AppConfig> {
  readonly controllers = [{ use: UserController, deps: {} }];
  readonly middlewares = [];
  readonly models = [];
  // Optional boot hook
  async register(ioc, config) { /* custom wiring if needed */ }
}
```

### Controllers

Base class, explicit routes via helper:

```ts
import { Controller, route, Ok } from '@kurdel/core';

export class UserController extends Controller {
  @route({ method: 'GET', path: '/users' })
  async list() { return Ok([{ id: 1, name: 'Ada' }]); }
}
```

### Results & errors

Return structured **ActionResult** helpers or throw **HttpError**:

```ts
import { Ok, NotFound } from '@kurdel/core';

if (!user) throw NotFound('User not found');
return Ok(user);
```

---

## IoC & tokens

kurdel relies on `@kurdel/ioc`:

* Contracts: `import type { Container } from '@kurdel/ioc/api'`
* Default impl: `import { IoCContainer } from '@kurdel/ioc'`
* Typed tokens:

```ts
import { TOKENS, createToken } from '@kurdel/core';
const UserRepoToken = createToken<UserRepo>('users/UserRepo');

container.bind(UserRepoToken).to(UserRepoImpl).inSingletonScope();
```

> Framework core re-exports its own tokens under `TOKENS.*` (e.g., `ServerAdapter`).

---

## Testing

`listen()` returns a handle that works well with supertest.

```ts
import request from 'supertest';
import { createApplication } from '@kurdel/core';
import type { Server } from 'node:http';

const app = await createApplication({ modules: [new UserModule()] });
const h = app.listen(0);
const srv = h.raw?.<Server>();
const res = await request(srv!).get('/users');
expect(res.status).toBe(200);
await h.close();
```

---

## Project layout (internal)

```
src/
  api/       # public contracts (types, tokens, base classes, helpers)
  runtime/   # implementations (adapters, modules, loaders)
  facade/    # public entry points (createApplication, startHttp)
  index.ts   # re-exports: API + selected facades
```

Consumers import only from the package root (e.g., `@kurdel/core`).

---

## CLI (migrations)

A small CLI integrates with DB migrations (optional).
When using `@kurdel/db`, your modules can register migrations and run them before `listen()`.

---

## Status

Early-stage, evolving API. Feedback & PRs are welcome.
Roadmap: request-scoped DI, in-memory HTTP adapter, router params/constraints, graceful shutdown hooks, API extractor.

