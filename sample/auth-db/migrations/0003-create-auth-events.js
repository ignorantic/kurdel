import { Migration } from '@kurdel/migrations';

export default class CreateAuthEvents extends Migration {
  async up() {
    await this.schema.create('auth_events', table => {
      table.integer('id').primaryKey();
      table.string('type', 64).notNull();
      table.datetime('occurred_at').notNull();
      table.string('strategy', 64).nullable();
      table.string('user_id', 255).nullable();
      table.string('credential_type', 64).nullable();
      table.string('credential_id', 255).nullable();
      table.string('reason', 64).nullable();
      table.string('policy', 128).nullable();
      table.index(['occurred_at']);
      table.index(['user_id', 'occurred_at']);
      table.index(['type', 'occurred_at']);
    });
  }

  async down() {
    await this.schema.dropIfExists('auth_events');
  }
}
