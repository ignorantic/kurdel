import { Migration } from '@kurdel/migrations';

export default class AddUserProfile extends Migration {
  constructor(connection) {
    super(connection);
    this.connection = connection;
  }

  async up() {
    await this.connection.run({
      sql: "ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT '';",
      params: [],
    });
    await this.connection.run({
      sql: "ALTER TABLE users ADD COLUMN email VARCHAR(254) NOT NULL DEFAULT '';",
      params: [],
    });
    await this.connection.run({
      sql: [
        "UPDATE users SET name = 'User ' || id,",
        "email = 'user-' || id || '@example.invalid';",
      ].join(' '),
      params: [],
    });
    await this.connection.run({
      sql: 'CREATE UNIQUE INDEX users_email_index ON users (email);',
      params: [],
    });
  }

  async down() {
    await this.connection.run({ sql: 'DROP INDEX IF EXISTS users_email_index;', params: [] });
    await this.connection.run({ sql: 'ALTER TABLE users DROP COLUMN email;', params: [] });
    await this.connection.run({ sql: 'ALTER TABLE users DROP COLUMN name;', params: [] });
  }
}
