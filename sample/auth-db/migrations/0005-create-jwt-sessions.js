import { Migration } from '@kurdel/migrations';

export default class CreateJwtSessions extends Migration {
  async up() {
    await this.schema.create('jwt_sessions', table => {
      table.string('id', 64).primaryKey();
      table.integer('user_id').notNull();
      table.string('status', 32).notNull().default('active');
      table.datetime('expires_at').notNull();
      table.datetime('created_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.foreign('user_id', 'users', 'id', { onDelete: 'CASCADE' });
      table.index(['user_id', 'created_at']);
      table.index(['expires_at']);
    });
  }

  async down() {
    await this.schema.dropIfExists('jwt_sessions');
  }
}
