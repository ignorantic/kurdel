import { Migration } from 'ijon';

export default class CreateRolesTable extends Migration {
  async up() {
    this.schema.create('roles', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
    });
  }

  async down() {
    this.schema.drop('roles');
  }
}

