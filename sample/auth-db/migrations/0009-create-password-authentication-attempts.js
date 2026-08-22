import { Migration } from '@kurdel/migrations';

export default class CreatePasswordAuthenticationAttempts extends Migration {
  async up() {
    await this.schema.create('password_authentication_attempts', table => {
      table.string('login', 254).primaryKey();
      table.integer('failed_attempts').notNull();
      table.datetime('window_started_at').notNull();
      table.datetime('locked_until').nullable();
      table.datetime('updated_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.index(['locked_until']);
    });
  }

  async down() {
    await this.schema.dropIfExists('password_authentication_attempts');
  }
}
