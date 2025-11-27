import { vi } from 'vitest';
import type {
  Middleware,
  MiddlewareRegistry,
  MiddlewareRegistration,
  MiddlewareZone,
  Controller,
} from '@kurdel/core/http';
import type { Newable } from '@kurdel/common';

export const mw = (
  fn: Middleware,
  opts: {
    zone?: MiddlewareZone;
    priority?: number;
    action?: string;
  } = {},
): MiddlewareRegistration => ({
  use: fn,
  zone: opts.zone ?? 'pre',
  priority: opts.priority ?? 0,
  action: opts.action,
});

export interface FakeRegistryConfig {
  global?: Partial<Record<MiddlewareZone, MiddlewareRegistration[]>>;
  controller?: Record<
    string,
    Partial<Record<MiddlewareZone, MiddlewareRegistration[]>>
  >;
}

export function makeFakeMiddlewareRegistry(
  config: FakeRegistryConfig = {},
): MiddlewareRegistry {
  const global = config.global ?? {};
  const controller = config.controller ?? {};

  const all = vi.fn((zone: MiddlewareZone): MiddlewareRegistration[] => {
    return [...(global[zone] ?? [])].sort((a, b) => b.priority - a.priority);
  });

  const forCtrl = vi.fn((
    ctor: Newable<Controller>,
    zone: MiddlewareZone,
    action?: string,
  ) => {
    const name = ctor.name;
    const zones = controller[name];
    if (!zones) return [];

    return [...(zones[zone] ?? [])]
      .filter(e => !e.action || e.action === action)
      .sort((a, b) => b.priority - a.priority);
  });

  return {
    use: vi.fn(),
    useFor: vi.fn(),
    all,
    for: forCtrl,
  };
}
