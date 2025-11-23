# 🧾 Kurdel Changelog

All notable changes will be documented in this file.  
This changelog follows the **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)** format  
and will track Kurdel’s evolution from its initial public alpha.

---

## [Unreleased] — ongoing development

### 🧩 Added
- **Schema-based validation**  
  - `schemaValidator` global middleware that validates `ctx.route.schema`  
  - `createValidator` factory for arbitrary schema libraries  
- **HttpContext Enhancements**  
  - Added `ctx.result` field to expose rendered response  
  - Added `ctx.route` reference with typed `RouteMatch` metadata  
- **Middleware improvements**  
  - Redesigned `MiddlewareRegistry` with zones and priorities  
  - Unified execution via `RuntimeMiddlewarePipe`  
- **Routing and orchestration**  
  - Extended `RuntimeRouter` to include per-route schemas  
  - Updated `RuntimeRequestOrchestrator` for zoned middleware chains  
- **Error handling**  
  - Introduced structured `ValidationError` with detailed field info  
  - Improved 400/404/500 rendering consistency  
- **Documentation**  
  - Added `ARCHITECTURE.md`, `CONTRIBUTING.md`, and `ROADMAP.md`  
  - Added this `CHANGELOG.md`  

### ⚙️ Changed
- Controllers now rely on schema validation instead of inline checks  
- Simplified controller actions — removed manual parameter validation  
- Moved logging and validation logic into reusable middlewares  
- Context creation now handled entirely by `RuntimeHttpContextFactory`  

### 🧰 Developer Experience
- Better error stack traces and validation messages  
- Improved local test setup using `createNodeApplication()` + `supertest`  
- `DEBUG_ROUTES=1` flag to inspect registered route table  

### 🧾 Documentation
- Rewritten high-level `README.md` for accurate architecture overview  
- New `ROADMAP.md` outlining targets for v0.1.0 → v0.2.0  

### 🧹 Maintenance
- Type cleanup in `@kurdel/core/http` and runtime factories  
- Reorganized `@kurdel/runtime/http` structure (router, orchestrator, factory)  
- Normalized `.js` extensions for all ESM imports  
- Updated TypeDoc comments and removed dead code  

---

## 🧭 Planned Milestones

### v0.1.0 — *First Public Alpha*
> Goal: fully typed runtime with working validation, routing, and IoC.

- [ ] Stabilize validation adapters (Zod, Yup, Ajv)
- [ ] Finalize unified `ValidationErrorMapper`
- [ ] Add minimal `pirx` CLI commands: `dev`, `routes:list`
- [ ] Improve DX for runtime debugging
- [ ] Publish packages to npm (under alpha tag)

---

### v0.2.0 — *Middleware & Observability*
> Goal: complete middleware lifecycle and profiling support.

- [ ] Introduce dynamic middleware inclusion (`useIf`)
- [ ] Add middleware grouping (`auth`, `metrics`, `validation`)
- [ ] Implement `RuntimeErrorPipeline` with structured handling
- [ ] Expose profiling hooks (`beforeExecute`, `afterExecute`, `onError`)
- [ ] Introduce unified ActionResult (`html`, `file`, `stream`, `view`)

---

### v0.3.0 — *Developer Experience & CLI*
> Goal: strengthen usability and developer tooling.

- [ ] `pirx generate` scaffolding for modules and controllers  
- [ ] Config resolver (`.kurdelrc`)  
- [ ] Hot-reloadable development mode (`pirx dev`)  
- [ ] Route inspection and module dependency graph  

---

### v1.0.0 — *Stable Runtime Release*
> Goal: production-ready Kurdel core with adapters and templates.

- [ ] ORM-lite layer for DB integration  
- [ ] Edge runtime adapter (Deno, Bun, Cloudflare)  
- [ ] Full documentation portal (architecture + API)  
- [ ] 100% test coverage for router/orchestrator/middleware  
- [ ] Tagged release and semver-stable APIs  

---

© 2025 Andrii Sorokin · MIT License
