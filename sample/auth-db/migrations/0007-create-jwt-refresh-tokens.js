import { Migration } from '@kurdel/migrations';

export default class CreateJwtRefreshTokens extends Migration {
  async up() {
    await this.schema.create('jwt_refresh_tokens', table => {
      table.string('session_id', 64).primaryKey();
      table.string('token_hash', 64).notNull().unique();
      table.datetime('expires_at').notNull();
      table.datetime('last_used_at').nullable();
      table.datetime('created_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.foreign('session_id', 'jwt_sessions', 'id', { onDelete: 'CASCADE' });
      table.index(['expires_at']);
    });
  }

  async down() {
    await this.schema.dropIfExists('jwt_refresh_tokens');
  }
}
