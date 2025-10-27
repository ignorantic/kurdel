# @kurdel/runtime-node

Native **Node.js HTTP adapter** for Kurdel runtime.  
Implements the `ServerAdapter` interface using the built-in `http` module.

---

## 📦 Installation

```bash
npm install @kurdel/runtime-node
```

---

## 🧠 Responsibilities

* Create and manage a native Node HTTP server
* Adapt Node’s `IncomingMessage` / `ServerResponse` to Kurdel `HttpRequest` / `HttpResponse`
* Dispatch incoming requests to the runtime handler

---

## 🔧 Example

```ts
import { createNodeApplication } from '@kurdel/facade';
const app = await createNodeApplication({ modules: [] });
app.listen(3000);
```

---

## 📄 License

MIT © Andrii Sorokin
