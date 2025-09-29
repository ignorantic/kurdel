import { Newable } from '@kurdel/common';
import type { Middleware } from 'src/api/types.js';
import { Controller } from 'src/api/controller.js';

export class MiddlewareRegistry {
  private readonly global: Middleware[] = [];
  private readonly perController = new Map<Newable<{}>, Middleware[]>();

  use(mw: Middleware) {
    this.global.push(mw);
  }

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
