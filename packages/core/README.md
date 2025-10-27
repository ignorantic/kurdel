# @kurdel/core

Core **contracts** and **interfaces** for the Kurdel framework.  
Contains stable, runtime-independent API definitions used by all other packages.

---

## 📦 Installation

```bash
npm install @kurdel/core
```

---

## 📘 Purpose

* Framework-agnostic HTTP contracts (`Controller`, `ActionResult`, `HttpContext`)
* Tokens and metadata utilities
* Base abstractions for routers, modules, and middlewares
* Type-safe route definitions (no decorators)

---

## 🔧 Example

```ts
import { Controller, route, Ok, type HttpContext } from '@kurdel/core/http';

export class UserController extends Controller {
  readonly routes = {
    list: route({ method: 'GET', path: '/users' })(this.list),
  };

  async list(_ctx: HttpContext) {
    return Ok([{ id: 1, name: 'Ada Lovelace' }]);
  }
}
```

---

## 🔗 Used by

* `@kurdel/runtime`
* `@kurdel/runtime-node`
* `@kurdel/facade`
* `@kurdel/template-ejs`

---

## 📄 License

MIT © Andrii Sorokin
