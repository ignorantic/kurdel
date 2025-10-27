# @kurdel/template-ejs

Integration module for using **EJS templates** with the Kurdel framework.  
Provides a unified `TemplateEngine` implementation for server-side rendering (SSR).

---

## 📦 Installation

```bash
npm install @kurdel/template-ejs
```

> Requires Node ≥ 18 and `@kurdel/core` / `@kurdel/runtime`.

---

## 🚀 Usage

```ts
import { EjsTemplateModule } from '@kurdel/template-ejs';
import { createNodeApplication } from '@kurdel/facade';

const app = await createNodeApplication({
  modules: [
    EjsTemplateModule.forRoot({ baseDir: 'views' }),
  ],
});
app.listen(3000);
```

Render a view from a controller:

```ts
import { Controller, route, View } from '@kurdel/core/http';

export class HomeController extends Controller {
  readonly routes = {
    index: route({ method: 'GET', path: '/' })(this.index),
  };

  async index() {
    return View('home', { title: 'Welcome to Kurdel!' });
  }
}
```

---

## ⚙️ Options

| Option      | Type     | Default   | Description                                     |
| ----------- | -------- | --------- | ----------------------------------------------- |
| `baseDir`   | `string` | `"views"` | Path to the directory containing EJS templates. |
| `extension` | `string` | `".ejs"`  | Template file extension.                        |

---

## 📄 License

MIT © Andrii Sorokin