# @kurdel/facade

Simplified **application entry point** for the Kurdel framework.  
Provides ready-to-use factories for Node and Express runtimes.

---

## 📦 Installation

```bash
npm install @kurdel/facade
```

---

## 🚀 Usage

```ts
import { createNodeApplication } from '@kurdel/facade';
import { Controller, route, Ok } from '@kurdel/core/http';

class HelloController extends Controller {
  readonly routes = { hello: route({ method: 'GET', path: '/hello' })(this.hello) };
  async hello() { return Ok({ message: 'Hello, kurdel!' }); }
}

const app = await createNodeApplication({
  modules: [{ controllers: [{ use: HelloController }] }],
});
app.listen(3000);
```

---

## 🧩 Exports

| Function                     | Runtime | Description                     |
| ---------------------------- | ------- | ------------------------------- |
| `createNodeApplication()`    | Node.js | Uses native HTTP server         |
| `createExpressApplication()` | Express | Uses Express middleware adapter |

---

## 📄 License

MIT © Andrii Sorokin
