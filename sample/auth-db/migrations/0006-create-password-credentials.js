import { Migration } from '@kurdel/migrations';

export default class CreatePasswordCredentials extends Migration {
  async up() {
    await this.schema.create('password_credentials', table => {
      table.integer('user_id').notNull();
      table.string('password_hash', 512).notNull();
      table.datetime('updated_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.primaryKey(['user_id']);
      table.foreign('user_id', 'users', 'id', { onDelete: 'CASCADE' });
    });
  }

  async down() {
    await this.schema.dropIfExists('password_credentials');
  }
}
