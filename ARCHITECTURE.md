# kurdel Architecture

Kurdel is a modular, strongly typed TypeScript framework built around explicit composition, contract-driven design, and deterministic runtime behavior.

The framework favors simple, composable building blocks over implicit behavior. Every dependency is explicit, every layer has a single responsibility, and every package owns a clearly defined part of the architecture.

---

## Architecture Layers

Kurdel is organized as a collection of independent packages.

| Package | Responsibility |
|---------|----------------|
| **@kurdel/common** | Shared primitives and low-level types |
| **@kurdel/core** | Public contracts, tokens, and framework interfaces |
| **@kurdel/runtime** | Routing, middleware pipeline, orchestration |
| **@kurdel/runtime-node** | Native Node.js adapter |
| **@kurdel/runtime-express** | Express adapter |
| **@kurdel/template-ejs** | EJS server-side rendering |
| **@kurdel/template-react** | React server-side rendering |
| **@kurdel/auth** | Authentication and authorization infrastructure |
| **@kurdel/auth-db** | Database-backed authentication adapters |
| **@kurdel/db** | Database abstraction |
| **@kurdel/migrations** | Schema evolution |
| **@kurdel/ioc** | Dependency injection container |
| **@kurdel/facade** | Public application bootstrap |
| **@kurdel/pirx** | CLI and developer tooling |

---

## Dependency Direction

Dependencies always point toward lower architectural layers.

```
Application
        │
        ▼
Facade
        │
        ▼
Runtime
        │
        ▼
Core
        │
        ▼
Common
```

Additional subsystems follow the same principle.

```
Auth
        │
        ▼
Core
        │
        ▼
Common
```

```
Auth DB
        │
        ▼
DB
        │
        ▼
Common
```

```
Migrations
        │
        ▼
DB
        │
        ▼
Common
```

Lower layers must never depend on higher layers.

Packages communicate through public contracts rather than implementation details.

---

## Core Principles

### Explicit composition

No decorators.

No reflection.

No hidden dependency injection.

Applications explicitly compose modules.

---

### Contract-driven design

`@kurdel/core` defines what exists.

Runtime packages define how those contracts are executed.

Applications provide implementations where appropriate.

---

### Single ownership

Each package owns a single architectural concern.

Examples:

- runtime owns HTTP execution
- auth owns authentication
- auth-db owns authentication persistence
- db owns database abstraction
- migrations own schema evolution

Responsibilities should not overlap.

---

### Transport independence

Business services do not know about HTTP.

They never:

- receive `HttpContext`
- return `ActionResult`
- access routes
- manipulate HTTP responses

Transport concerns remain inside the runtime.

---

### Explicit dependencies

Every dependency is visible in constructors or module configuration.

No hidden global state.

No implicit service location.

---

### Deterministic execution

A request always follows the same execution pipeline.

The runtime does not perform hidden work.

---

## Data Ownership

Every architectural layer owns its own data.

| Data | Owner |
|------|-------|
| HTTP request | Runtime |
| HttpContext | Runtime |
| Route metadata | Runtime |
| Authentication state | Auth |
| Authorization policies | Auth |
| Database persistence | DB adapters |
| Database schema | Application |
| Business entities | Application |

Data should not leak across architectural boundaries.

---

## Runtime Pipeline

Every request follows the same high-level pipeline.

```
resolve
    ↓
validate
    ↓
pre
    ↓
controller
    ↓
render
    ↓
post
    ↓
error
    ↓
final
```

Responsibilities:

| Stage | Responsibility |
|--------|----------------|
| resolve | Match route |
| validate | Validate request schemas |
| pre | Cross-cutting middleware |
| controller | Execute action |
| render | Produce response |
| post | Post-processing |
| error | Handle failures |
| final | Cleanup |

---

## Package Responsibilities

### Common

Contains only reusable primitives.

Never depends on other Kurdel packages.

---

### Core

Defines framework contracts.

Contains:

- interfaces
- tokens
- application contracts

Contains no runtime logic.

---

### Runtime

Executes HTTP requests.

Responsible for:

- routing
- middleware
- orchestration
- rendering
- context creation

Not responsible for:

- authentication
- persistence
- business logic

---

### Auth

Provides authentication and authorization infrastructure.

Responsible for:

- strategies
- policies
- authentication middleware
- authentication events

Not responsible for:

- persistence
- user management

---

### Auth DB

Provides database-backed implementations for Auth contracts.

Responsible for:

- repositories
- management services
- transactional persistence

Not responsible for:

- authentication algorithms
- authorization decisions

---

### Database

Provides a transport-independent database abstraction.

Responsible for:

- connections
- queries
- transactions

Not responsible for:

- application models
- migrations

---

### Migrations

Owns schema evolution.

Responsible for:

- migrations
- schema updates

Not responsible for:

- runtime persistence

---

## Architectural Building Blocks

### Module

Modules compose the application.

Responsibilities:

- register providers
- register middleware
- configure runtime

Modules contain no business logic.

---

### Registry

Registries store named runtime components.

Examples:

- strategies
- policies
- middleware

Registries never execute business logic.

---

### Repository

Repositories expose persisted state.

Responsibilities:

- load data
- persist data

Repositories do not coordinate workflows.

---

### Service

Services coordinate application workflows.

Responsibilities may include:

- transactions
- validation
- coordination of multiple repositories

Services remain transport-independent.

---

## Documentation Conventions

Public APIs should describe architecture rather than implementation.

### Public classes

Every exported class begins with:

```ts
/**
 * ## ClassName
 *
 * Responsibilities
 *
 * Guarantees
 *
 * Non-responsibilities
 */
```

Focus on architectural intent.

---

### Public methods

Document:

- purpose
- observable behavior
- invariants

Avoid documenting obvious implementation details.

---

### Large classes

Organize methods by responsibility.

Typical sections:

```ts
// ---------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Error translation
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------
```

Responsibility grouping is preferred over visibility grouping.

---

## TypeScript Conventions

- ESM only
- named exports only
- no default exports
- `import type` for type-only imports
- explicit `.js` extensions for local imports
- explicit public return types
- prefer `unknown` over `any`

---

## Naming Conventions

| Kind | Example |
|------|---------|
| Runtime implementation | `RuntimeRouter` |
| Module | `AuthModule` |
| Registry | `AuthStrategyRegistry` |
| Repository | `DatabaseAuthUserRepository` |
| Service | `DatabaseUserService` |
| Middleware | `schemaValidator` |
| Validator adapter | `zodAdapter` |
| Template module | `ReactTemplateModule` |

---

## Testing Principles

Tests should be:

- deterministic
- isolated
- in-process
- transport-independent

Prefer:

- fake adapters
- in-memory implementations
- reusable test utilities

Avoid external infrastructure whenever possible.

---

## Summary

Kurdel is built around a small set of architectural invariants:

- explicit composition
- contract-driven design
- deterministic execution
- transport-independent services
- single ownership of responsibilities
- dependency direction toward lower layers
- package communication through public contracts only

These principles take precedence over individual implementation details and guide the evolution of every package in the framework.

---

© 2025–2026 Andrii Sorokin · MIT License