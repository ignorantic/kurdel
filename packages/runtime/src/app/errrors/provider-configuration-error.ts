/**
 * Thrown when a provider declaration is structurally valid
 * but logically inconsistent with IoC container rules.
 *
 * Typical causes:
 * - Declaring an async factory without marking it as `singleton`
 * - Using `useFactory` or `useClass` with incompatible `deps`
 * - Attempting to bind a provider that resolves to `undefined`
 *
 * This error indicates a configuration problem within a single
 * provider definition, not a higher-level module composition issue.
 *
 * @example
 * ```ts
 * throw new ProviderConfigurationError(
 *   `Async factory for "${String(provider.provide)}" must be declared as singleton.`
 * );
 * ```
 *
 * @see ModuleValidationError - for module-level composition issues
 */
export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderConfigurationError';
  }
}
