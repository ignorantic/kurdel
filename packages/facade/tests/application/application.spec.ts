import { describe, it, expect } from 'vitest';

import { type AppModule } from '@kurdel/core/app';
import { createApplication } from 'src/create-application.js';

const TOKEN_A = Symbol('A');
const TOKEN_B = Symbol('B');
const TOKEN_FACTORY = Symbol('factory');
const TOKEN_SINGLETON = Symbol('factory-singleton');

const fakeAdapter = {
  on: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
};

describe('Application', () => {
  it('should throw if required import is missing', async () => {
    class ImportingModule implements AppModule {
      readonly imports = { a: TOKEN_A };
      async register() {}
    }

    // no module provides TOKEN_A
    await expect(() =>
      createApplication({ serverAdapter: fakeAdapter, db: false, modules: [new ImportingModule()] })
    ).rejects.toThrow(/Missing dependency/);
  });

  it('should throw if expected export not registered', async () => {
    class BadModule implements AppModule {
      readonly exports = { b: TOKEN_B };
      async register() {}
    }

    await expect(() =>
      createApplication({ serverAdapter: fakeAdapter, db: false, modules: [new BadModule()] })
    ).rejects.toThrow(/Module did not register expected export/);
  });

  it('should support useFactory without singleton', async () => {
    let counter = 0;

    class FactoryModule implements AppModule {
      readonly providers = [
        {
          provide: TOKEN_FACTORY,
          useFactory: () => ({ n: ++counter }),
          isSingleton: false,
        },
      ];
      async register() {}
    }

    const app = await createApplication({
      serverAdapter: fakeAdapter,
      db: false,
      modules: [new FactoryModule()],
    });
    const ioc = app.getContainer();
    const first = ioc.get<{ n: number }>(TOKEN_FACTORY);
    const second = ioc.get<{ n: number }>(TOKEN_FACTORY);
    expect(first.n).not.toBe(second.n); // should be new each time
  });

  it('should support useFactory with singleton', async () => {
    let counter = 0;

    class FactoryModule implements AppModule {
      readonly providers = [
        {
          provide: TOKEN_SINGLETON,
          useFactory: () => ({ n: ++counter }),
          singleton: true,
        },
      ];
      async register() {}
    }

    const app = await createApplication({
      serverAdapter: fakeAdapter,
      db: false,
      modules: [new FactoryModule()],
    });
    const ioc = app.getContainer();
    const first = ioc.get<{ n: number }>(TOKEN_SINGLETON);
    const second = ioc.get<{ n: number }>(TOKEN_SINGLETON);
    expect(first.n).toBe(second.n); // same instance
  });
});
