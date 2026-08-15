# @kurdel/migrations

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
