import { DatabaseFactory, PostgresDriver, postgresPlaceholders } from '../src/index.js';

describe('PostgreSQL adapter', () => {
  it('creates a PostgreSQL driver from the common factory', () => {
    expect(DatabaseFactory.createDriver({
      type: 'postgres',
      connectionString: 'postgres://localhost/kurdel_test',
    })).toBeInstanceOf(PostgresDriver);
  });

  it('converts portable placeholders without changing string literals', () => {
    expect(postgresPlaceholders(
      "SELECT '?' AS literal FROM users WHERE id = ? AND email = ?;",
    )).toBe("SELECT '?' AS literal FROM users WHERE id = $1 AND email = $2;");
  });
});
