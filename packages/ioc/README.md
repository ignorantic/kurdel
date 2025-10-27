# @kurdel/ioc

Lightweight **dependency injection container** used across the Kurdel framework.  
Designed for modular architecture, request-scoped resolution, and type-safe tokens.

---

## 📦 Installation

```bash
npm install @kurdel/ioc
```

---

## 🚀 Usage

```ts
import { createContainer, createToken } from '@kurdel/ioc';

interface UserRepo { findAll(): any[] }
class UserRepoImpl implements UserRepo {
  findAll() { return [{ id: 1, name: 'Ada' }]; }
}

const token = createToken<UserRepo>('UserRepo');
const ioc = createContainer();

ioc.bind(token).to(UserRepoImpl).inSingletonScope();

const repo = ioc.get(token);
console.log(repo.findAll());
```

---

## 📄 License

MIT © Andrii Sorokin
