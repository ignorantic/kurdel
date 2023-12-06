import { Schema } from '../schema/schema.js';
import { IDatabase } from './interfaces.js';

export abstract class Migration {
  protected schema: Schema;

  constructor(connection: IDatabase) {
    this.schema = new Schema(connection);
  }

  abstract up(): Promise<any>;
  abstract down(): Promise<any>;
}
