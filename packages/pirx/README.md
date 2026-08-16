# @kurdel/pirx

Command-line tooling for Kurdel applications. The current beta provides
interactive database migration commands backed by `@kurdel/migrations`.

## Installation

```bash
npm install --save-dev @kurdel/pirx@beta
```

## Usage

```bash
npx pirx migrate run
npx pirx migrate rollback
npx pirx migrate refresh
npx pirx migrate status
```

The commands use the database and migration configuration of the current
Kurdel application.

Mutating commands acquire a database-backed lease before discovering or
executing migrations, preventing concurrent deploys from applying the same
migration. The lease is released after success or failure. `status` is
read-only and lists applied migrations with their batch, pending files, and
applied records whose migration file is missing.

## Requirements

Node.js 20.19+, 22.12+, or 24+.

## License

MIT © Andrii Sorokin
