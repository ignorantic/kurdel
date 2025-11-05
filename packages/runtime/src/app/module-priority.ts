/**
 * Defines standard initialization priorities for core modules.
 *
 * Lower value → initialized earlier.
 */
export enum ModulePriority {
  Lifecycle = 10,
  Database = 20,
  User = 30,
  Model = 40,
  Middleware = 50,
  Controller = 60,
  Platform = 65, // platform-specific bindings (e.g. Node renderers)
  Server = 70,
  Custom = 100, // default for user modules without explicit priority
}
