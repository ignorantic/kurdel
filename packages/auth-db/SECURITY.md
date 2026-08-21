# Security

## Overview

`@kurdel/auth-db` provides secure default implementations for
credential persistence.

Applications remain responsible for:

- transport security (HTTPS)
- secret management
- database security
- authentication policies

---

## Passwords

Passwords are never stored directly.

The package stores password hashes inside the
`password_credentials` table.

Default implementation:

- Scrypt

Applications may replace the hasher through:

```ts
new AuthDatabaseModule({
  passwordHasher: customHasher,
});
```

---

## API keys

API keys are generated using cryptographically secure random bytes.

Only SHA-256 hashes are persisted.

The original API key is returned once during creation.

Lost keys cannot be recovered.

---

## JWT sessions

JWT access tokens remain cryptographically self-contained. Session-backed JWT
authentication is stateful because each request checks persisted revocation
and expiration state.

Server-side revocation is implemented through persisted JWT sessions.

Applications should use:

- short-lived access tokens
- longer-lived refresh tokens

---

## Refresh tokens

Refresh tokens are generated from cryptographically secure random bytes.

Only SHA-256 hashes are stored.

Every successful refresh rotates the token.

A previously used refresh token immediately becomes invalid.

Rotation prevents reuse only after one request has successfully replaced the
stored token. If a stolen token is presented before the legitimate client uses
it, the attacker may win that rotation race. The package does not currently
detect reuse of an older token or revoke an entire token family automatically.

---

## Authentication audit

Audit events never contain sensitive credentials.

Stored metadata may include:

- event type
- user id
- strategy
- credential id
- failure reason
- authorization policy

Passwords, API keys and refresh tokens are never persisted in audit
events.

---

## Transactions

Critical operations execute inside a database transaction.

Examples:

- create user
- replace user roles
- issue API key
- revoke API key
- create JWT session
- revoke JWT session
- rotate refresh token

When audit persistence is enabled, audit events participate in the same
transaction.

---

## Recommendations

Production deployments should:

- enforce HTTPS
- rotate signing secrets
- use short-lived JWT access tokens
- use refresh token rotation
- enable authentication audit
- periodically remove expired sessions
- monitor failed authentication events

---

## Threat model

The package protects against:

- plaintext password disclosure
- plaintext API key disclosure
- reuse of a refresh token after successful rotation
- use of revoked JWT sessions
- use of revoked API keys

The package does not protect against:

- database compromise
- application vulnerabilities
- stolen signing secrets
- compromised client devices
