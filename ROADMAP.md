# 🧭 Kurdel Roadmap

> Target version: **v1.0.0 (Q2 2026)**  
> Status: *post-decomposition stabilization*  
> Focus: *developer experience, validation, observability, and runtime maturity.*

---

## 🚀 1. Runtime Evolution

### ✅ Completed
- Separated `RuntimeRouter` and `RuntimeRequestOrchestrator`
- Introduced `RuntimeMiddlewarePipe` for unified middleware execution
- Implemented `HttpContext.result` tracking
- Added route-level schemas and Zod adapter support

### 🔜 Next
| Goal | Description | Priority |
|------|--------------|-----------|
| **Validation lifecycle** | Finalize `schemaValidator` middleware reading from `ctx.route.schema` | 🔥 High |
| **Error adapters** | Create `ValidationErrorMapper` system for Zod / Yup / Ajv | 🔥 High |
| **RuntimeErrorPipeline** | Separate structured error handling (onError hooks) | ⚙️ Medium |
| **Profiling hooks** | Add `beforeExecute`, `afterExecute`, and `onError` event emitters | ⚙️ Medium |
| **Unified ActionResult** | Extend to include `html()`, `file()`, `stream()`, and SSR-aware variants | 🧩 Medium |

---

## 🧩 2. Middleware Architecture

### ✅ Completed
- Implemented `MiddlewareRegistry` with `zone` and `priority`
- Added route-aware schema validation middleware

### 🔜 Next
| Feature | Description | Priority |
|----------|--------------|-----------|
| **Dynamic middleware inclusion** | `useIf(predicate, middleware)` | ⚙️ Medium |
| **Named middleware groups** | Support for grouping by context (`auth`, `metrics`, `validation`) | ⚙️ Medium |
| **Declarative zones** | Standard zones: `pre`, `auth`, `main`, `post`, `error` | ⚙️ Medium |
| **Global observability middleware** | Plug-in for structured logging and metrics | 🧠 Medium |

---

## 🧠 3. Orchestrator & Context

| Improvement | Description | Priority |
|--------------|--------------|-----------|
| **Refined orchestrator lifecycle** | Add context-aware error and completion hooks | 🔥 High |
| **`RuntimeHttpContextFactory` enrichment** | Include `ctx.route`, typed schemas, and response helpers | ✅ Done |
| **`ctx.result` instrumentation** | Enable runtime inspection for metrics and testing | ✅ Done |
| **ResponseRenderer improvements** | Unify across Node and Express adapters | 🧩 Medium |

---

## ⚙️ 4. Developer Experience (DX)

| Feature | Description | Priority |
|----------|--------------|-----------|
| **Pirx CLI v2** | Commands: `pirx dev`, `pirx generate`, `pirx db:migrate` | 🔥 High |
| **Config resolver** | `.kurdelrc` / JSON-based module configuration | ⚙️ Medium |
| **Hot reload** | Support for module re-bootstrap in development | ⚙️ Medium |
| **Route inspection command** | `pirx routes:list` → display all registered routes | 🧩 Medium |

---

## 💾 5. Database Layer

| Enhancement | Description | Priority |
|--------------|--------------|-----------|
| **Model abstraction** | Introduce `BaseModel<T>` with CRUD and validation | ⚙️ Medium |
| **Repository pattern (optional)** | Layer above models for domain logic | 🧩 Medium |
| **SQLite & Postgres adapters** | Extend beyond in-memory mock | ⚙️ Medium |
| **`@kurdel/orm-lite`** | Experimental ORM-like query builder | 🔬 Low |

---

## 🧪 6. Testing Framework

| Goal | Description | Priority |
|------|--------------|-----------|
| **In-memory HTTP adapter** | `InMemoryServerAdapter` for pure runtime tests | 🔥 High |
| **TestApplication wrapper** | Build app without starting real server | ⚙️ Medium |
| **FakeContext utilities** | Pre-built `FakeRouter`, `FakeController`, `FakeContext` | ⚙️ Medium |
| **Integration test coverage** | Focus on router + middleware orchestration | ✅ Ongoing |

---

## 🧰 7. Documentation & API Consistency

| Task | Description | Priority |
|------|--------------|-----------|
| **architecture.md** | Keep up-to-date with current runtime separation | ✅ Done |
| **contributing.md** | Expanded with coding standards and workflows | ✅ Done |
| **roadmap.md** | This file — to be versioned with releases | ✅ Done |
| **middleware.md** | Explain zones, registry, and order of execution | ⚙️ Medium |
| **validation.md** | Document adapters, schema design, and ValidationError flow | ⚙️ Medium |

---

## 🌐 8. Platform Extensions

| Adapter | Purpose | Status |
|----------|----------|---------|
| **@kurdel/runtime-node** | Native Node adapter | ✅ Stable |
| **@kurdel/runtime-express** | Express middleware integration | ✅ Stable |
| **@kurdel/runtime-edge** | Target: Deno / Cloudflare Workers | 🧩 Planned |
| **@kurdel/runtime-bun** | Bun-native adapter | 🧩 Planned |

---

## 🧠 9. Long-Term Vision (2026+)

- **Unified Observability** — built-in tracing, structured logs, request IDs  
- **Edge-native runtime** — no Node dependencies  
- **SSR unification** — shared rendering contracts for EJS, React, and Handlebars  
- **Configurable pipelines** — middleware + controller composition via JSON  
- **GraphQL module** — optional layer built on runtime contracts  

---

## ✅ 10. Summary

Kurdel’s foundation is stable — router, orchestrator, IoC, and context are mature.  
The focus now shifts from *architecture* to *developer experience*, *validation*, and *runtime ergonomics*.

> **Goal:** Make Kurdel feel like a framework that’s *fun to build with*,  
> without ever sacrificing its principles of **clarity, explicitness, and type safety.**

---

© 2025 Andrii Sorokin · MIT License
