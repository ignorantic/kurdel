import type { Newable } from '@kurdel/common';
import type { Controller, Middleware, MiddlewareRegistry } from '@kurdel/core/http';
import type { MiddlewareZone, MiddlewareRegistration } from '@kurdel/core/http';

export class RuntimeMiddlewareRegistry implements MiddlewareRegistry {
  private readonly global = new Map<MiddlewareZone, MiddlewareRegistration[]>();
  private readonly perController = new Map<
    Newable<Controller>,
    Map<MiddlewareZone, MiddlewareRegistration[]>
  >();

  use(mw: Middleware, opts: { zone?: MiddlewareZone; priority?: number } = {}): void {
    const zone = opts.zone ?? 'pre';
    const priority = opts.priority ?? 0;
    const entry: MiddlewareRegistration = { use: mw, zone, priority };
    if (!this.global.has(zone)) this.global.set(zone, []);
    this.global.get(zone)!.push(entry);
  }

  useFor(
    controller: Newable<Controller>,
    mw: Middleware,
    opts: { zone?: MiddlewareZone; priority?: number; action?: string } = {}
  ): void {
    const zone = opts.zone ?? 'pre';
    const priority = opts.priority ?? 0;
    const entry: MiddlewareRegistration = { use: mw, zone, priority, action: opts.action };

    if (!this.perController.has(controller)) {
      this.perController.set(controller, new Map());
    }
    const zones = this.perController.get(controller)!;
    if (!zones.has(zone)) zones.set(zone, []);
    zones.get(zone)!.push(entry);
  }

  for(
    controller: Newable<Controller>,
    zone: MiddlewareZone = 'pre',
    action?: string
  ): MiddlewareRegistration[] {
    const map = this.perController.get(controller);
    if (!map) return [];

    const entries = map.get(zone) ?? [];
    return entries
      .filter(e => !e.action || e.action === action)
      .sort((a, b) => b.priority - a.priority);
  }

  all(zone: MiddlewareZone = 'pre'): MiddlewareRegistration[] {
    return (this.global.get(zone) ?? []).sort((a, b) => b.priority - a.priority);
  }
}
