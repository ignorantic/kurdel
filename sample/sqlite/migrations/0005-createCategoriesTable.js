import { Migration } from '@kurdel/migrations';

export default class CreateCategoriesTable extends Migration {
  async up() {
    this.schema.create('categories', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
      table.integer('parentId');
    });
  }

  async down() {
    this.schema.drop('categories');
  }
}

