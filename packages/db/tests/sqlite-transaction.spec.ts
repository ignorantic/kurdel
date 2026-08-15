import { SQLiteDB } from '../src/sqlite-db.js';

describe('SQLiteDB transactions', () => {
  it('commits the callback result and all writes atomically', async () => {
    const db = new SQLiteDB(':memory:');
    await db.run({ sql: 'CREATE TABLE values_table (value INTEGER NOT NULL);', params: [] });

    const result = await db.transaction(async transaction => {
      await transaction.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [1] });
      await transaction.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [2] });
      return 'committed';
    });

    expect(result).toBe('committed');
    await expect(db.all({ sql: 'SELECT value FROM values_table ORDER BY value;', params: [] }))
      .resolves.toEqual([{ value: 1 }, { value: 2 }]);
    await db.close();
  });

  it('rolls back every write when the callback fails', async () => {
    const db = new SQLiteDB(':memory:');
    await db.run({ sql: 'CREATE TABLE values_table (value INTEGER NOT NULL);', params: [] });

    await expect(db.transaction(async transaction => {
      await transaction.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [1] });
      throw new Error('audit failed');
    })).rejects.toThrow('audit failed');

    await expect(db.all({ sql: 'SELECT value FROM values_table;', params: [] })).resolves.toEqual([]);
    await db.close();
  });

  it('keeps outside operations behind the complete transaction callback', async () => {
    const db = new SQLiteDB(':memory:');
    await db.run({ sql: 'CREATE TABLE values_table (value INTEGER NOT NULL);', params: [] });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });

    const transaction = db.transaction(async session => {
      await session.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [1] });
      await gate;
      await session.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [2] });
    });
    const outside = db.run({ sql: 'INSERT INTO values_table (value) VALUES (?);', params: [3] });
    release();
    await Promise.all([transaction, outside]);

    await expect(db.all({ sql: 'SELECT value FROM values_table;', params: [] })).resolves.toEqual([
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]);
    await db.close();
  });
});
