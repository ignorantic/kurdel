import { describe, it, expect, vi } from 'vitest';
import { IDatabase } from '@kurdel/db';
import { ModelModule } from 'src/runtime/modules/model-module.js';
import { Model } from 'src/api/db/model.js';

describe('ModelModule', () => {
  it('should register models with db dependency', async () => {
    class TestModel extends Model {
      table = 'test';
    }

    const withFn = vi.fn();
    const put = vi.fn(() => ({ with: withFn }));
    const ioc = { put } as any;

    const module = new ModelModule([TestModel]);
    await module.register(ioc);

    expect(put).toHaveBeenCalledWith(TestModel);
    expect(withFn).toHaveBeenCalledWith({ db: IDatabase });
  });
});
