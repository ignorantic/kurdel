import { Migration } from '@kurdel/migrations';

export default class CreateAuthSchema extends Migration {
  async up() {
    await this.schema.create('users', table => {
      table.integer('id').primaryKey();
      table.string('status', 32).notNull().default('active');
      table.datetime('created_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.datetime('updated_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
    });

    await this.schema.create('roles', table => {
      table.integer('id').primaryKey();
      table.string('name', 100).notNull().unique();
    });

    await this.schema.create('user_roles', table => {
      table.integer('user_id').notNull();
      table.integer('role_id').notNull();
      table.primaryKey(['user_id', 'role_id']);
      table.foreign('user_id', 'users', 'id', { onDelete: 'CASCADE' });
      table.foreign('role_id', 'roles', 'id', { onDelete: 'CASCADE' });
      table.index(['role_id']);
    });

    await this.schema.create('api_keys', table => {
      table.string('id', 64).primaryKey();
      table.integer('user_id').notNull();
      table.string('key_hash', 128).notNull();
      table.string('name', 100).notNull();
      table.string('status', 32).notNull().default('active');
      table.datetime('expires_at').nullable();
      table.datetime('last_used_at').nullable();
      table.datetime('created_at').notNull().defaultRaw('CURRENT_TIMESTAMP');
      table.foreign('user_id', 'users', 'id', { onDelete: 'CASCADE' });
      table.uniqueIndex(['key_hash']);
      table.index(['user_id']);
    });
  }

  async down() {
    await this.schema.dropIfExists('api_keys');
    await this.schema.dropIfExists('user_roles');
    await this.schema.dropIfExists('roles');
    await this.schema.dropIfExists('users');
  }
}
