import { Newable } from '@kurdel/common';
import { Container } from '@kurdel/ioc';
import { ControllerResolver } from '@kurdel/core/http';

export class RuntimeControllerResolver implements ControllerResolver {
  constructor(private readonly root: Container) {}

  /**
   * Resolve controller instance from the provided request scope.
   * Falls back to the root container when not registered in the scope.
   */
  resolve<T>(cls: Newable<T>, scope: Container): T {
    const c = scope ?? this.root;

    // Prefer request scope; if scope.has() falls back to parent itself, the try-get below is enough.
    if (typeof c.has === 'function') {
      if (c.has(cls)) return c.get<T>(cls);
      // fallback to root if scope doesn't have it AND has() doesn't climb parents
      if (c !== this.root && this.root.has?.(cls)) return this.root.get<T>(cls);
    }

    // If has() isn’t available or already climbs to parent, single get() is sufficient.
    try {
      return c.get<T>(cls);
    } catch {
      // Final fallback to root
      return this.root.get<T>(cls);
    }
  }

  /** @deprecated kept for backward-compat; prefer resolve(cls, scope) */
  get<T>(cls: Newable<T>): T {
    return this.root.get<T>(cls);
  }
}
