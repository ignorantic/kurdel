import { Migration } from '@kurdel/migrations';

export default class CreateRolePermissions extends Migration {
  async up() {
    await this.schema.create('permissions', table => {
      table.integer('id').primaryKey();
      table.string('name', 120).notNull().unique();
    });

    await this.schema.create('role_permissions', table => {
      table.integer('role_id').notNull();
      table.integer('permission_id').notNull();
      table.primaryKey(['role_id', 'permission_id']);
      table.foreign('role_id', 'roles', 'id', { onDelete: 'CASCADE' });
      table.foreign('permission_id', 'permissions', 'id', { onDelete: 'CASCADE' });
      table.index(['permission_id']);
    });
  }

  async down() {
    await this.schema.dropIfExists('role_permissions');
    await this.schema.dropIfExists('permissions');
  }
}
