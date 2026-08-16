# @kurdel/db

Kurdel's database contract and built-in SQLite and PostgreSQL adapters.

Create either driver through the same factory:

```ts
const sqlite = DatabaseFactory.createDriver({
  type: 'sqlite',
  filename: './app.db',
});

const postgres = DatabaseFactory.createDriver({
  type: 'postgres',
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
```

Portable application queries use `?` placeholders. The PostgreSQL adapter
converts them to positional parameters before execution. `get`, `all`, `run`,
transactions, and connection shutdown have the same contract for both
adapters.

Database contracts, SQLite connectivity, and query-building utilities for
Kurdel applications.

## Transactions

Use `IDatabase.transaction` to execute related operations atomically:

```ts
const user = await db.transaction(async transaction => {
  const created = await transaction.get({
    sql: 'INSERT INTO users (email) VALUES (?) RETURNING id, email;',
    params: ['ada@example.test'],
  });
  await transaction.run({
    sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
    params: [created.id, 2],
  });
  return created;
});
```

The callback result is returned after commit. Throwing or rejecting rolls back
every operation performed through the supplied `IDatabaseSession`.

Always use the callback's `transaction` argument inside the callback. Calling
the outer `db` object would schedule work outside the transaction and may wait
for the callback to finish. Nested transactions are intentionally not exposed
by `IDatabaseSession`.

The SQLite implementation serializes the complete callback with respect to
all other operations on its connection. This prevents another request from
interleaving a query between `BEGIN` and `COMMIT`.

Custom database implementations must provide the same atomic callback
semantics and ensure that the supplied session stays on one connection for the
duration of the transaction.

## License

MIT © Andrii Sorokin
