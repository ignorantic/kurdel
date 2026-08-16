import type { IDatabase } from '@kurdel/db';

import { Schema } from '../src/index.js';

describe('Schema', () => {
  it('creates the table before its indexes', async () => {
    const run = vi.fn(async () => undefined);
    const schema = new Schema({ run } as unknown as IDatabase);

    await schema.create('users', table => {
      table.integer('id').primaryKey();
      table.string('email').notNull();
      table.uniqueIndex(['email']);
    });

    expect(run).toHaveBeenNthCalledWith(1, {
      sql: 'CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255) NOT NULL);',
      params: [],
    });
    expect(run).toHaveBeenNthCalledWith(2, {
      sql: 'CREATE UNIQUE INDEX users_email_index ON users (email);',
      params: [],
    });
  });

  it('awaits drop operations', async () => {
    const run = vi.fn(async () => undefined);
    const schema = new Schema({ run } as unknown as IDatabase);

    await schema.dropIfExists('users');

    expect(run).toHaveBeenCalledWith({
      sql: 'DROP TABLE IF EXISTS users;',
      params: [],
    });
  });

  it('can initialize shared infrastructure tables idempotently', async () => {
    const run = vi.fn(async () => undefined);
    const schema = new Schema({ run } as unknown as IDatabase);

    await schema.createIfNotExists('migration_locks', table => {
      table.integer('id').primaryKey();
    });

    expect(run).toHaveBeenCalledWith({
      sql: 'CREATE TABLE IF NOT EXISTS migration_locks (id INTEGER PRIMARY KEY);',
      params: [],
    });
  });
});
