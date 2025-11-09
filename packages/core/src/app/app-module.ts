import type { Identifier, Container } from '@kurdel/ioc';

import type { AppConfig } from 'src/app/index.js';

/**
 * Describes how a dependency should be provided to the IoC container.
 */
export type ProviderConfig<T = any> =
  | {
      /** Provide a class that will be instantiated by the container */
      provide: Identifier<T>;
      useClass: new (...args: any[]) => T;
      /**
       * Optional dependencies explicitly injected into the constructor
       * (useful for manual wiring or when no metadata is available)
       */
      deps?: Record<string, Identifier<unknown>>;
      /**
       * Hint for container: store singleton or create per-scope instance
       * (container may ignore this if its lifecycle rules override)
       */
      singleton?: boolean;
    }
  | {
      /** Provide a pre-constructed instance */
      provide: Identifier<T>;
      useInstance: T;
    }
  | {
      /** Provide a custom factory function */
      provide: Identifier<T>;
      useFactory: (ioc: Container) => T | Promise<T>;
      singleton?: boolean;
    };

/**
 * A unit of application composition (feature module).
 *
 * Modules can:
 * - import tokens from other modules
 * - export tokens for reuse
 * - provide dependencies
 * - execute async setup logic in `register()`
 */
export interface AppModule<TConfig = AppConfig> {
  /** Determines initialization order. Lower = earlier. */
  readonly priority?: number;

  /** Tokens or modules this one depends on */
  readonly imports?: Identifier<any>[] | Record<string, Identifier<any>>;

  /** Tokens this module exposes for others */
  readonly exports?: Identifier<any>[] | Record<string, Identifier<any>>;

  /** Declarative provider registrations */
  readonly providers?: ProviderConfig[];

  /**
   * Imperative setup hook for dynamic logic.
   * Called once during app initialization.
   */
  register?(ioc: Container, config: TConfig): Promise<void> | void;
}
