# @kurdel/runtime-express

**Express-based runtime adapter** for Kurdel.  
Provides a drop-in replacement for the native Node runtime with Express middleware support.

---

## 📦 Installation

```bash
npm install @kurdel/runtime-express
```

---

## 🚀 Usage

```ts
import { createExpressApplication } from '@kurdel/facade';

const app = await createExpressApplication({
  modules: [],
});

app.listen(3000);
```

---

## 💡 Notes

* Fully compatible with `express` middlewares
* Uses the same `Controller` and `ActionResult` abstractions as other runtimes

---

## 📄 License

MIT © Andrii Sorokin
