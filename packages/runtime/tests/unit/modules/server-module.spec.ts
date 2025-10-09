import { describe, it, expect } from 'vitest';
import { TOKENS } from '@kurdel/core/app';

import { ServerModule } from 'src/modules/server-module.js';

describe('ServerModule', () => {
  it('should provide IServerAdapter with default server', () => {
    const module = new ServerModule({});

    const hasServerProvider = module.providers.some(
      (p) => 'provide' in p && p.provide === TOKENS.ServerAdapter
    );

    expect(hasServerProvider).toBe(true);
  });
});
