# @kurdel/common

## Environment configuration

Define typed environment variables and validate all of them before application
startup:

```ts
import { env, loadEnv } from '@kurdel/common';

const environment = loadEnv({
  NODE_ENV: env.enum(['development', 'test', 'production'], {
    default: 'development',
  }),
  PORT: env.number({ default: 3000, integer: true, min: 1, max: 65_535 }),
  DATABASE_URL: env.string({ minLength: 1 }),
  ENABLE_AUDIT: env.boolean({ default: true }),
  SENTRY_DSN: env.optional(env.string()),
});
```

The returned object is inferred from the schema. Invalid configuration throws
one `EnvironmentValidationError` containing every affected variable and safe
reason, without including rejected values.

Shared TypeScript types, interfaces, and utilities used by Kurdel packages.
Application code normally receives this package transitively through the
framework packages that depend on it.

## Installation

```bash
npm install @kurdel/common@beta
```

## Exports

The package exposes common HTTP types, authentication user contracts, JSON
loading helpers, and URL utilities from its main entry point.

## Requirements

Node.js 20.19+, 22.12+, or 24+.

## License

MIT © Andrii Sorokin
