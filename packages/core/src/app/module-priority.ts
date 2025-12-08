/**
 * ## ModulePriority
 *
 * Standard initialization weights for Kurdel application modules.
 *
 * Lower number → earlier initialization.
 *
 * Recommended lifecycle:
 *
 * 10  Lifecycle   — framework boot logic, configuration preparation
 * 20  Database    — database clients/drivers
 * 30  User        — user-defined modules (default fallback)
 * 40  Model       — model definition + schema registration
 * 50  Middleware  — global middleware registry
 * 60  Auth        — authentication/authorization middleware hookup
 * 70  Controller  — controller registration + route table build
 * 80  Platform    — platform-specific bindings (Node/Express/Fastify/etc.)
 * 90  Server      — server start module
 *
 * 100 Custom — fallback for modules without explicit priority
 */
export enum ModulePriority {
  Lifecycle = 10,
  Database = 20,
  User = 30,
  Model = 40,
  Middleware = 50,
  Auth = 60,
  Controller = 70,
  Platform = 80,
  Server = 90,
  Custom = 100,
}
