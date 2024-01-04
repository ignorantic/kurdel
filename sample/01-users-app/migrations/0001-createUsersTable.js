import { Migration } from '@kurdel/common';

export default class CreateUsersTable extends Migration {
  async up() {
    this.schema.create('users', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
      table.string('role');
    });
  }

  async down() {
    this.schema.drop('users');
  }
}

