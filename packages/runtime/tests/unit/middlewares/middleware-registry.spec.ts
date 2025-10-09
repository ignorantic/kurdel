import { describe, it, expect } from 'vitest';
import { type Middleware, Controller } from '@kurdel/core/http';

import { RuntimeMiddlewareRegistry } from 'src/http/runtime-middleware-registry.js';

class DummyController extends Controller {
  routes = {};
}

describe('MiddlewareRegistry', () => {
  it('should register and return global middleware', () => {
    const registry = new RuntimeMiddlewareRegistry();
    const mw: Middleware = async (_, next) => next();

    registry.use(mw);

    expect(registry.all()).toContain(mw);
  });

  it('should register and return controller-specific middleware', () => {
    const registry = new RuntimeMiddlewareRegistry();
    const mw1: Middleware = async (_, next) => next();
    const mw2: Middleware = async (_, next) => next();

    registry.useFor(DummyController, mw1);
    registry.useFor(DummyController, mw2);

    const result = registry.for(DummyController);

    expect(result).toContain(mw1);
    expect(result).toContain(mw2);
    expect(result.length).toBe(2);
  });

  it('should return empty array if no middleware registered for controller', () => {
    const registry = new RuntimeMiddlewareRegistry();
    expect(registry.for(DummyController)).toEqual([]);
  });
});
