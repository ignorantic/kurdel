# @kurdel/migrations

Schema blueprints use the connected database dialect. SQLite emits its native
integer primary keys and `DATETIME`, while PostgreSQL emits identity columns,
`TIMESTAMPTZ`, and native boolean defaults from the same migration source.

`MigrationManager` serializes `run`, `rollback`, and `refresh` through a
portable database lease. This prevents concurrent processes from applying the
same migration and releases the lease even when discovery or execution fails.
Use `manager.status()` to inspect applied batches and pending migration files
without acquiring the mutation lock.

Database schema migration primitives for Kurdel. The package provides the
`Migration`, `MigrationManager`, `Schema`, and `Blueprint` APIs used to define,
apply, roll back, and refresh migrations.

## Installation

```bash
npm install @kurdel/migrations@beta @kurdel/db@beta
```

## Migration example

```ts
import { Migration } from '@kurdel/migrations';

export default class CreateUsers extends Migration {
  async up() {
    await this.schema.create('users', table => {
      table.integer('id').primaryKey();
      table.string('email').unique();
    });
  }

  async down() {
    await this.schema.dropIfExists('users');
  }
}
```

Use `@kurdel/pirx` to run migrations from the command line.

## Requirements

Node.js 20.19+, 22.12+, or 24+.

## License

MIT © Andrii Sorokin
