import { describe, it, expect, vi } from 'vitest';

import { type AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import { NoopResponseRenderer } from '@kurdel/runtime/http';

import { createApplication } from 'src/create-application.js';

const TOKEN_A = Symbol('A');
const TOKEN_B = Symbol('B');
const TOKEN_FACTORY = Symbol('factory');
const TOKEN_SINGLETON = Symbol('factory-singleton');

/**
 * Minimal test adapter mock
 * Required only because RuntimeComposer expects a ServerAdapter token.
 */
const AdapterModule: AppModule = {
  providers: [
    {
      provide: TOKENS.ServerAdapter,
      useInstance: {
        on: vi.fn(),
        listen: vi.fn(),
        close: vi.fn(),
      },
    },
  ],
};

const RendererModule = {
  providers: [
    {
      provide: TOKENS.ResponseRenderer,
      useFactory: () => new NoopResponseRenderer(),
      singleton: true,
    },
  ],
};

describe('Application', () => {
  it('should throw if required import is missing', async () => {
    class ImportingModule implements AppModule {
      readonly imports = { a: TOKEN_A };
      async register() {}
    }

    await expect(() =>
      createApplication({
        db: false,
        modules: [AdapterModule, RendererModule, new ImportingModule()],
      })
    ).rejects.toThrow(/Module ImportingModule missing dependency/);
  });

  it('should throw if declared export is not bound in the container', async () => {
    class BadModule implements AppModule {
      readonly exports = { b: TOKEN_B };
      async register() {}
    }

    await expect(() =>
      createApplication({
        db: false,
        modules: [AdapterModule, RendererModule, new BadModule()],
      })
    ).rejects.toThrow(/did not register expected export/);
  });

  it('should support useFactory without singleton', async () => {
    let counter = 0;

    class FactoryModule implements AppModule {
      readonly providers = [
        {
          provide: TOKEN_FACTORY,
          useFactory: () => ({ n: ++counter }),
        },
      ];
      async register() {}
    }

    const app = await createApplication({
      db: false,
      modules: [AdapterModule, RendererModule, new FactoryModule()],
    });
    const ioc = app.getContainer();

    const first = ioc.get<{ n: number }>(TOKEN_FACTORY);
    const second = ioc.get<{ n: number }>(TOKEN_FACTORY);
    expect(first.n).not.toBe(second.n);
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
      db: false,
      modules: [AdapterModule, RendererModule, new FactoryModule()],
    });
    const ioc = app.getContainer();

    const first = ioc.get<{ n: number }>(TOKEN_SINGLETON);
    const second = ioc.get<{ n: number }>(TOKEN_SINGLETON);
    expect(first.n).toBe(second.n);
  });
});
