import { describe, it, expect } from 'vitest';
import { ServerModule } from 'src/runtime/modules/server-module.js';
import { TOKENS } from 'src/api/app/tokens.js';

describe('ServerModule', () => {
  it('should provide IServerAdapter with default server', () => {
    const module = new ServerModule({});

    const hasServerProvider = module.providers.some(
      (p) => 'provide' in p && p.provide === TOKENS.ServerAdapter
    );

    expect(hasServerProvider).toBe(true);
  });
});
