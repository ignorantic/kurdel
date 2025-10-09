import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IDatabase } from '@kurdel/db';

import { Model } from 'src/db/model.js';

// fake child model
class UserModel extends Model {
  protected table = 'users';
}

describe('Model (base class)', () => {
  let mockDb: IDatabase;
  let model: UserModel;

  beforeEach(() => {
    mockDb = {
      run: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
      get: vi.fn().mockResolvedValue({ id: 42, name: 'Bob' }),
      all: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    } as any;

    model = new UserModel({ db: mockDb });
  });

  it('should call db.run on create', async () => {
    const data = { name: 'Charlie' };
    const result = await model.create(data);

    expect(mockDb.run).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  it('should call db.get on find', async () => {
    const result = await model.find('id', [42]);

    expect(mockDb.get).toHaveBeenCalled();
    expect(result).toEqual({ id: 42, name: 'Bob' });
  });

  it('should call db.all on findAll', async () => {
    const result = await model.findAll();

    expect(mockDb.all).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
