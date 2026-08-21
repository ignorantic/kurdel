# Changelog

All notable changes to Kurdel are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-beta.6] - 2026-08-22

### Added

- add persistent refresh-token sessions with hashed storage and rotation
- add session listing, individual revocation, global revocation, and logout workflows
- add declarative `jwtStrategy()` and `apiKeyStrategy()` provider helpers
- add `databaseAuthEventSink()` for database audit integration without internal DI tokens

### Changed

- simplify built-in authentication configuration across JWT and auth database samples
- remove deprecated TypeScript `baseUrl` and empty `paths` settings
- expand package, security, runtime, and repository architecture documentation

### Security

- rotate opaque refresh tokens atomically and invalidate previously used values
- document the current refresh-token replay model and token-family limitations
- distinguish self-contained JWTs from stateful server-side session validation

## [0.1.0-beta.5] - 2026-08-16

### Fixed

- make dashboard API-key expiration and recent authentication queries portable to PostgreSQL
- normalize PostgreSQL aggregate counts to numbers before returning administration statistics

## [0.1.0-beta.4] - 2026-08-16

### Added

- add PostgreSQL database support and cross-dialect auth integration coverage
- add serialized migration operations and migration status reporting
- add declarative environment parsing with aggregated startup validation
- add role permissions, composable authorization policies, and policy diagnostics
- add persisted, revocable JWT sessions backed by the auth database
- add scrypt password hashing, database-backed credentials, and password login

### Changed

- rename database contracts to remove the remaining `I` interface prefixes
- keep user roles and permissions sourced from current database state during authentication

### Security

- store password credentials separately from user profiles as salted scrypt hashes
- return the same authentication failure for unknown logins and invalid passwords
- bind issued JWTs to revocable, expiring server-side sessions

## [0.1.0-beta.3] - 2026-08-16

### Added

- add searchable and sortable database user listings
- add transactional bulk status, role, and deletion operations
- add role lifecycle management with assignment counts
- add administration dashboard statistics
- add paginated global audit queries with user, type, and date filters

## [0.1.0-beta.2] - 2026-08-16

### Security

- update the SQLite peer dependency to 6.0.1, replacing the vulnerable
  `node-gyp` and `tar` dependency chain used by SQLite 5.x

### Changed

- align all public packages and internal dependency ranges on `0.1.0-beta.2`

## [0.1.0-beta.1] - 2026-08-16

### Added

- modular HTTP runtime with native Node.js and Express adapters
- explicit dependency injection, request scopes, routing, middleware zones, and lifecycle modules
- EJS and React server-side rendering packages
- database abstractions, SQLite support, migrations, and the Pirx migration CLI
- storage-agnostic API-key and JWT authentication with role and policy authorization
- database-backed users, roles, API keys, usage tracking, and security audit events
- sample applications, including a React user and credential administration interface

### Changed

- aligned all public packages on the coordinated `0.1.0-beta.1` prerelease
- pinned internal prerelease dependencies to the same framework version
- standardized MIT licensing and npm publication metadata
- added atomic callback-based database transactions for multi-step writes

### Security

- store API keys as hashes and return raw credentials only when issued
- exclude credentials and request bodies from persisted authentication audit events
- perform credential mutations and their audit records within one transaction

### Beta notice

- public APIs remain subject to change until `1.0.0`
- packages require Node.js 20.19+, 22.12+, or 24+
- prerelease packages are published under the npm `beta` dist-tag

[Unreleased]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.6...HEAD
[0.1.0-beta.6]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.5...v0.1.0-beta.6
[0.1.0-beta.5]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.4...v0.1.0-beta.5
[0.1.0-beta.4]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.3...v0.1.0-beta.4
[0.1.0-beta.3]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.2...v0.1.0-beta.3
[0.1.0-beta.2]: https://github.com/ignorantic/kurdel/compare/v0.1.0-beta.1...v0.1.0-beta.2
[0.1.0-beta.1]: https://github.com/ignorantic/kurdel/releases/tag/v0.1.0-beta.1
