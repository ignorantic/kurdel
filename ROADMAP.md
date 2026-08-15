# Kurdel roadmap

Kurdel is preparing its first public beta, `0.1.0-beta.1`. The beta validates
the package boundaries, runtime contracts, database integration, and
authentication model before the APIs become stable.

## Beta stabilization

- collect feedback on package installation and application composition
- document public APIs and migration paths between prereleases
- expand compatibility testing across supported Node.js releases
- harden error handling and observability hooks
- improve test utilities for applications and adapters

## Developer experience

- add Pirx generators, development mode, and route inspection
- provide a unified project configuration resolver
- improve module dependency graph diagnostics
- add hot-reload workflows for server and React development

## Runtime and platform support

- refine structured error handling and response helpers
- add conditional middleware and named middleware groups
- explore Bun, Deno, and edge runtime adapters
- expand template and validation adapter coverage

## Data layer

- stabilize the database and migration contracts from beta feedback
- add a PostgreSQL adapter
- evaluate an optional repository or ORM-lite layer
- extend migration tooling and schema operations

## Toward 1.0

The `1.0.0` release will follow only after the public package surface is
documented, upgrade behavior is defined, supported runtimes are continuously
tested, and the core contracts have demonstrated stability across beta users.

---

© 2025–2026 Andrii Sorokin · [MIT License](LICENSE)
