import { Migration } from '@kurdel/common';

export default class CreateAdministratorsTable extends Migration {
  async up() {
    this.schema.create('administrators', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
    });
  }

  async down() {
    this.schema.drop('administrators');
  }
}

