import { IDatabase } from '@kurdel/db';
import { Schema } from './schema.js';

export abstract class Migration {
  protected schema: Schema;

  constructor(connection: IDatabase) {
    this.schema = new Schema(connection);
  }

  abstract up(): Promise<any>;
  abstract down(): Promise<any>;
}
