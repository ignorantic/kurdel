import type { Database } from '@kurdel/db';
import { Schema } from './schema.js';

export abstract class Migration {
  protected schema: Schema;

  constructor(connection: Database) {
    this.schema = new Schema(connection);
  }

  abstract up(): Promise<any>;
  abstract down(): Promise<any>;
}
