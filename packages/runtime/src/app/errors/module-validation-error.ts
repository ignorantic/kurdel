/**
 * Thrown when a module fails structural or dependency validation
 * during the application bootstrap phase.
 *
 * Typical causes:
 * - Duplicate provider tokens declared across multiple modules
 * - Missing imported tokens that were never exported by any module
 * - Declared exports that are not actually registered in the container
 *
 * This error represents a higher-level composition problem —
 * it indicates that the module graph itself is inconsistent,
 * not an issue within a single provider definition.
 *
 * @example
 * ```ts
 * throw new ModuleValidationError(
 *   `Duplicate provider for token "${String(token)}" between modules "${a}" and "${b}".`
 * );
 * ```
 *
 * @see ProviderConfigurationError - for per-provider misconfiguration
 */
export class ModuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModuleValidationError';
  }
}
