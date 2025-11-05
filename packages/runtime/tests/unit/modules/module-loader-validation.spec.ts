import { describe, it, expect } from 'vitest';
import type { AppModule } from '@kurdel/core/app';
import { IoCContainer, type Identifier } from '@kurdel/ioc';

import { ModuleLoader } from 'src/app/module-loader.js';
import { ModuleValidationError } from 'src/app/errors/module-validation-error.js';

describe('ModuleLoader validation', () => {
  it('should throw if imported token is missing', async () => {
    const ioc = new IoCContainer();
    const missingToken: Identifier<any> = Symbol('missing');

    const mod: AppModule = {
      imports: { missingToken },
    };

    const loader = new ModuleLoader(ioc);

    await expect(loader.init([mod], {} as any)).rejects.toThrowError(ModuleValidationError);
  });

  it('should throw if declared export is not bound in the container', async () => {
    const ioc = new IoCContainer();
    const exportedToken: Identifier<any> = Symbol('exported');

    const mod: AppModule = {
      exports: { exportedToken },
    };

    const loader = new ModuleLoader(ioc);

    await expect(loader.init([mod], {} as any)).rejects.toThrowError(ModuleValidationError);
  });

  it('should succeed when imports and exports are valid', async () => {
    const ioc = new IoCContainer();
    const tokenA: Identifier<any> = Symbol('A');
    const tokenB: Identifier<any> = Symbol('B');

    // Bind tokenA before loading modules
    ioc.bind(tokenA).toInstance({});

    const modA: AppModule = {
      exports: { tokenA },
    };

    const modB: AppModule = {
      imports: { tokenA },
      providers: [{ provide: tokenB, useInstance: {} }],
      exports: { tokenB },
    };

    const loader = new ModuleLoader(ioc);

    await expect(loader.init([modA, modB], {} as any)).resolves.not.toThrow();
    expect(ioc.has(tokenA)).toBe(true);
    expect(ioc.has(tokenB)).toBe(true);
  });

  it('should register provider before validating its export', async () => {
    const ioc = new IoCContainer();
    const tokenX: Identifier<any> = Symbol('X');

    const mod: AppModule = {
      providers: [{ provide: tokenX, useInstance: { ok: true } }],
      exports: { tokenX },
    };

    const loader = new ModuleLoader(ioc);

    await expect(loader.init([mod], {} as any)).resolves.not.toThrow();
    expect(ioc.get(tokenX)).toEqual({ ok: true });
  });
});
