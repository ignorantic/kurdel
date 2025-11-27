import type { Identifier, Container } from '@kurdel/ioc';
import type { AppConfig } from 'src/app/index.js';

/**
 * ## ClassProviderConfig
 *
 * Registers a class constructor as a provider.
 * Instances are created by the IoC container, optionally with:
 * - explicit `deps` mapping for constructor injection
 * - lifecycle mode (`singleton` or per-scope)
 */
export type ClassProviderConfig<T = any> = {
  provide: Identifier<T>;
  useClass: new (...args: any[]) => T;
  deps?: Record<string, Identifier<unknown>>;
  singleton?: boolean;
};

/**
 * ## InstanceProviderConfig
 *
 * Registers a pre-constructed instance.
 * No lifecycle or dependency metadata — the provided instance is used as-is.
 */
export type InstanceProviderConfig<T = any> = {
  provide: Identifier<T>;
  useInstance: T;
};

/**
 * ## FactoryProviderConfig
 *
 * Registers a factory function.
 * The function receives the IoC container and must produce a value.
 * Can optionally opt into singleton mode.
 */
export type FactoryProviderConfig<T = any> = {
  provide: Identifier<T>;
  useFactory: (ioc: Container) => T | Promise<T>;
  singleton?: boolean;
};

/**
 * ## ProviderConfig
 *
 * Unified provider registration type for feature modules.
 * Covers:
 * - class providers
 * - instance providers
 * - factory providers
 */
export type ProviderConfig<T = any> =
  | ClassProviderConfig<T>
  | InstanceProviderConfig<T>
  | FactoryProviderConfig<T>;

/**
 * ## AppModule
 *
 * Feature module — a self-contained composition unit.
 *
 * Provides:
 * - dependency tokens
 * - configuration-driven providers
 * - optional setup logic via `register()`
 *
 * Modules define what they export and what dependencies they require.
 */
export interface AppModule<TConfig = AppConfig> {
  /** Determines initialization order (lower = earlier). */
  readonly priority?: number;

  /** Tokens or modules this one depends on. */
  readonly imports?: Identifier<any>[] | Record<string, Identifier<any>>;

  /** Tokens this module exports for other modules. */
  readonly exports?: Identifier<any>[] | Record<string, Identifier<any>>;

  /** Declarative provider registrations. */
  readonly providers?: ProviderConfig[];

  /**
   * Imperative setup hook.
   * Called once during application initialization.
   */
  register?(ioc: Container, config: TConfig): Promise<void> | void;
}
