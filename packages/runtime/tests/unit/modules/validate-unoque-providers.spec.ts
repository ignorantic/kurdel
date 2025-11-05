import { describe, it, expect } from 'vitest';
import type { AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';

import { RuntimeComposer } from 'src/app/runtime-composer.js';
import { ModuleValidationError } from 'src/app/errors/module-validation-error.js';

describe('RuntimeComposer.validateUniqueProviders', () => {
  it('should throw if two modules provide the same token', () => {
    const modA: AppModule = {
      providers: [{ provide: TOKENS.ResponseRenderer, useInstance: {} }],
    };
    const modB: AppModule = {
      providers: [{ provide: TOKENS.ResponseRenderer, useInstance: {} }],
    };

    expect(() =>
      (RuntimeComposer as any).validateUniqueProviders([modA, modB])
    ).toThrow(ModuleValidationError);
  });

  it('should pass when tokens are unique', () => {
    const modA: AppModule = { providers: [{ provide: 'A', useInstance: {} }] };
    const modB: AppModule = { providers: [{ provide: 'B', useInstance: {} }] };

    expect(() =>
      (RuntimeComposer as any).validateUniqueProviders([modA, modB])
    ).not.toThrow();
  });

  it('should not fail if modules have no providers', () => {
    const modA: AppModule = {};
    const modB: AppModule = {};

    expect(() =>
      (RuntimeComposer as any).validateUniqueProviders([modA, modB])
    ).not.toThrow();
  });

  it('should include module names in error message', () => {
    class ModA {}
    class ModB {}

    const modA = { providers: [{ provide: 'X', useInstance: {} }] } as AppModule;
    const modB = { providers: [{ provide: 'X', useInstance: {} }] } as AppModule;

    Object.setPrototypeOf(modA, ModA.prototype);
    Object.setPrototypeOf(modB, ModB.prototype);

    try {
      (RuntimeComposer as any).validateUniqueProviders([modA, modB]);
    } catch (err) {
      expect(err).toBeInstanceOf(ModuleValidationError);
      expect((err as Error).message).toMatch(/Duplicate provider/);
      expect((err as Error).message).toMatch(/ModA/);
      expect((err as Error).message).toMatch(/ModB/);
    }
  });
});
