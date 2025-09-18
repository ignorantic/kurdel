import { describe, it, expect } from 'vitest';
import { ServerModule } from '../../../src/modules/server-module.js';
import { IServerAdapter } from '../../../src/http/interfaces.js';

describe('ServerModule', () => {
  it('should provide IServerAdapter with default server', () => {
    const module = new ServerModule({});

    const hasServerProvider = module.providers.some(
      (p) => 'provide' in p && p.provide === IServerAdapter
    );

    expect(hasServerProvider).toBe(true);
  });
});
