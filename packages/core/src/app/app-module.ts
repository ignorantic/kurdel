import type { Identifier, Container } from '@kurdel/ioc';
import type { AppConfig } from './config.js';

/**
 * ProviderConfig
 *
 * Describes how a dependency should be provided to the IoC container.
 *
 * - `useClass`: Register a class with optional dependencies (resolved via IoC).
 * - `useInstance`: Provide a pre-constructed instance (singleton).
 * - `useFactory`: Provide a factory function for custom instantiation logic.
 */
export type ProviderConfig<T = any> =
  | {
      provide: Identifier<T>;
      useClass: new (...args: any[]) => T;
      deps?: Record<string, Identifier<T>>;
      isSingleton?: boolean;
    }
  | {
      provide: Identifier<T>;
      useInstance: T;
    }
  | {
      provide: Identifier<T>;
      useFactory: (ioc: Container) => T;
      isSingleton?: boolean;
    };

/**
 * AppModule
 *
 * A unit of application composition.
 * - Can import tokens from other modules
 * - Can export tokens for others
 * - Can provide classes or instances
 * - Can run custom async logic in register()
 */
export interface AppModule<TConfig = AppConfig> {
  /** Tokens this module depends on */
  readonly imports?: Record<string, any>;

  /** Tokens this module exports for others */
  readonly exports?: Record<string, any>;

  /** Providers defined declaratively */
  readonly providers?: ProviderConfig[];

  /**
   * Register additional logic (async, dynamic config, side effects).
   *
   * Called by Application during initialization.
   * Even if module uses only providers, this method must exist.
   */
  register(ioc: Container, config: TConfig): Promise<void> | void;
}
