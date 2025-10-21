import { Migration } from '@kurdel/migrations';

export default class CreateCitiesTable extends Migration {
  async up() {
    this.schema.create('cities', (table) => {
      table.integer('id');
      table.primaryKey('id');
      table.string('name');
    });
  }

  async down() {
    this.schema.drop('cities');
  }
}

