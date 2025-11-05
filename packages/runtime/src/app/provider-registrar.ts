import type { ProviderConfig } from '@kurdel/core/app';
import type { Container } from '@kurdel/ioc';

import { ProviderConfigurationError } from 'src/app/errrors/provider-configuration-error.js';

/**
 * Registers dependency providers in the IoC container according to DI semantics.
 *
 * Supported provider forms:
 * - `useClass` — binds a class (constructor) with optional dependencies and lifecycle hint.
 * - `useInstance` — binds an existing instance (always singleton).
 * - `useFactory` — binds a factory function (sync or async), optionally cached as singleton.
 *
 * Async factories are handled gracefully:
 * - If the factory returns a Promise and `singleton` is true, the resolved instance is bound.
 * - Otherwise, async non-singleton factories are disallowed (runtime error).
 *
 * Design notes:
 * - This class is a low-level helper used by `ModuleLoader`.
 * - It performs no validation beyond binding logic — imports/exports are checked elsewhere.
 */
export class ProviderRegistrar {
  constructor(private readonly ioc: Container) {}

  /**
   * Register a single provider within the container.
   *
   * @param provider - Declarative provider configuration.
   * @throws {Error} If async factory is declared without `singleton: true`.
   */
  register<T>(provider: ProviderConfig<T>): void {
    // --- 1️⃣ useClass: bind class constructor ---
    if ('useClass' in provider) {
      const binding = this.ioc.bind<T>(provider.provide).to(provider.useClass);

      if (provider.deps) binding.with(provider.deps);
      if (provider.singleton) binding.inSingletonScope();

      return;
    }

    // --- 2️⃣ useInstance: bind pre-constructed instance ---
    if ('useInstance' in provider) {
      this.ioc.bind<T>(provider.provide).toInstance(provider.useInstance);
      return;
    }

    // --- 3️⃣ useFactory: bind factory (sync or async) ---
    if ('useFactory' in provider) {
      const result = provider.useFactory(this.ioc);

      // Async factory case
      if (result instanceof Promise) {
        if (!provider.singleton) {
          throw new ProviderConfigurationError(
            `Async factory for "${String(provider.provide)}" must be declared as singleton.`
          );
        }

        // When the promise resolves, bind the instance
        result.then(instance => {
          this.ioc.bind<T>(provider.provide).toInstance(instance);
        });

        return;
      }

      // Sync factory case
      if (provider.singleton) {
        this.ioc.bind<T>(provider.provide).toInstance(result);
      } else {
        this.ioc.toFactory(provider.provide, () => provider.useFactory(this.ioc) as T);
      }
    }
  }
}
