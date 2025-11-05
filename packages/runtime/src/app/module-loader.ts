import type { AppModule, AppConfig } from '@kurdel/core/app';
import type { Container } from '@kurdel/ioc';

import { ProviderRegistrar } from 'src/app/provider-registrar.js';
import { ModuleValidationError } from 'src/app/runtime-composer.js';

/**
 * Loads and initializes all application modules.
 *
 * Responsibilities:
 * - Validate declared `imports` (fail fast if required tokens are missing)
 * - Register `providers` into the IoC container using ProviderRegistrar
 * - Execute each module’s optional `register(ioc, config)` hook
 * - Verify that declared `exports` are actually bound in the container
 *
 * Design notes:
 * - Modules are processed sequentially to ensure deterministic initialization order.
 * - Each module operates within the same root container (no nested scopes here).
 * - The loader itself performs no lifecycle logic — only structural assembly.
 */
export class ModuleLoader {
  constructor(private readonly ioc: Container) {}

  /**
   * Initialize the given list of modules in order.
   *
   * @param modules - Ordered list of application modules to load.
   * @param config - Immutable application configuration.
   *
   * Throws if a module import or export token is missing in the container.
   */
  async init(modules: AppModule[], config: AppConfig): Promise<void> {
    const registrar = new ProviderRegistrar(this.ioc);

    for (const mod of modules) {
      // --- 1️⃣ Validate declared imports ---
      if (mod.imports) {
        for (const dep of Object.values(mod.imports)) {
          if (!this.ioc.has(dep)) {
            throw new ModuleValidationError(`Module ${mod.constructor.name} missing dependency: ${String(dep)}`);
          }
        }
      }

      // --- 2️⃣ Register providers ---
      if (mod.providers) {
        for (const provider of mod.providers) {
          registrar.register(provider);
        }
      }

      // --- 3️⃣ Execute custom register() hook ---
      if (typeof mod.register === 'function') {
        await mod.register(this.ioc, config);
      }

      // --- 4️⃣ Validate declared exports ---
      if (mod.exports) {
        for (const token of Object.values(mod.exports)) {
          if (!this.ioc.has(token)) {
            throw new ModuleValidationError(`Module did not register expected export: ${String(token)}`);
          }
        }
      }
    }
  }
}
