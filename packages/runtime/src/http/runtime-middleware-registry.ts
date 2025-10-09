import type { Newable } from '@kurdel/common';
import type { Controller } from '@kurdel/core/http';
import { type Middleware, type MiddlewareRegistry } from '@kurdel/core/http';

export class RuntimeMiddlewareRegistry implements MiddlewareRegistry {
  private readonly global: Middleware[] = [];
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  private readonly perController = new Map<Newable<{}>, Middleware[]>();

  use(mw: Middleware) {
    this.global.push(mw);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  useFor(controller: Newable<{}>, mw: Middleware) {
    if (!this.perController.has(controller)) {
      this.perController.set(controller, []);
    }
    this.perController.get(controller)!.push(mw);
  }

  all(): Middleware[] {
    return [...this.global];
  }

  for(controller: Newable<Controller>): Middleware[] {
    return this.perController.get(controller) ?? [];
  }
}
