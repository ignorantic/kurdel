import { describe, it, expect, vi } from 'vitest';
import { ServiceModule } from '../../src/modules/service-module.js';

describe('ServiceModule', () => {
  it('should register services from config', async () => {
    class TestService {}

    const put = vi.fn();
    const ioc = { put } as any;

    const module = new ServiceModule();
    await module.register(ioc, { services: [TestService] });

    expect(put).toHaveBeenCalledWith(TestService);
  });
});
