import { Migration } from '@kurdel/migrations';

export default class CreatePasswordResetTokens extends Migration {
  async up() {
    await this.schema.create('password_reset_tokens', table => {
      table.string('token_hash', 64).primaryKey();
      table.integer('user_id').notNull();
      table.datetime('expires_at').notNull();
      table.datetime('created_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.foreign('user_id', 'users', 'id', { onDelete: 'CASCADE' });
      table.index(['user_id']);
      table.index(['expires_at']);
    });
  }

  async down() {
    await this.schema.dropIfExists('password_reset_tokens');
  }
}
