# @kurdel/runtime

Runtime **implementation layer** of Kurdel.  
Includes router, controller resolver, lifecycle orchestration, and middleware handling.

---

## 📦 Installation

```bash
npm install @kurdel/runtime
````

---

## 🧩 Responsibilities

* Routing and controller dispatch
* Middleware registry and composition
* Module loading and lifecycle management
* Template engine integration (via `TemplateEngine` interface)

---

## 🚀 Example

```ts
import { route, Controller, Ok } from '@kurdel/core/http';

export class PingController extends Controller {
  readonly routes = {
    ping: route({ method: 'GET', path: '/ping' })(this.ping),
  };
  async ping() { return Ok({ ok: true }); }
}
```

Used indirectly via `@kurdel/facade`.

---

## 📄 License

MIT © Andrii Sorokin
