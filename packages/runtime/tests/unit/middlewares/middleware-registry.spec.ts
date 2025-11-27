/**
 * RuntimeMiddlewareRegistry — Unit Test Suite
 *
 * Covers:
 *   1️⃣ Global middleware registration
 *   2️⃣ Controller-specific middleware
 *   3️⃣ Action-specific filtering
 *   4️⃣ Empty lookups
 *   5️⃣ Combined global + controller behavior
 */

import { describe, it, expect } from 'vitest';
import { type Middleware, Controller } from '@kurdel/core/http';
import { RuntimeMiddlewareRegistry } from 'src/http/runtime-middleware-registry.js';

/** Dummy controller for scoped middleware tests */
class DummyController extends Controller {
  readonly routes = {};
}

describe('RuntimeMiddlewareRegistry', () => {
  const dummyMw: Middleware = async (_, next) => next();

  // 1️⃣ Global middleware
  it('registers and returns global middleware by zone', () => {
    const registry = new RuntimeMiddlewareRegistry();
    registry.use(dummyMw, { zone: 'pre', priority: 0 });

    const allPre = registry.all('pre');

    expect(allPre).toHaveLength(1);
    expect(allPre[0].use).toBe(dummyMw);
    expect(allPre[0].zone).toBe('pre');
    expect(allPre[0].priority).toBe(0);
  });

  // 2️⃣ Controller-scoped middleware
  it('registers and returns controller-specific middleware', () => {
    const registry = new RuntimeMiddlewareRegistry();

    const mw1: Middleware = async (_, next) => next();
    const mw2: Middleware = async (_, next) => next();

    registry.useFor(DummyController, mw1, { zone: 'pre', priority: 1 });
    registry.useFor(DummyController, mw2, { zone: 'post', priority: 2 });

    const preEntries = registry.for(DummyController, 'pre');
    const postEntries = registry.for(DummyController, 'post');

    expect(preEntries).toHaveLength(1);
    expect(preEntries[0].use).toBe(mw1);

    expect(postEntries).toHaveLength(1);
    expect(postEntries[0].use).toBe(mw2);
  });

  // 3️⃣ Action filtering
  it('filters controller middleware by action', () => {
    const registry = new RuntimeMiddlewareRegistry();
    const mw: Middleware = async (_, next) => next();

    registry.useFor(DummyController, mw, {
      zone: 'pre',
      priority: 0,
      action: 'getOne',
    });

    const found = registry.for(DummyController, 'pre', 'getOne');
    const notFound = registry.for(DummyController, 'pre', 'otherAction');

    expect(found).toHaveLength(1);
    expect(found[0].action).toBe('getOne');

    expect(notFound).toHaveLength(0);
  });

  // 4️⃣ Empty lookup
  it('returns an empty array when no middleware is registered', () => {
    const registry = new RuntimeMiddlewareRegistry();
    const none = registry.for(DummyController, 'pre');

    expect(none).toEqual([]);
  });

  // 5️⃣ Combined global + controller behavior
  it('separates global and controller-scoped middleware', () => {
    const registry = new RuntimeMiddlewareRegistry();

    const globalMw: Middleware = async (_, next) => next();
    const ctrlMw: Middleware = async (_, next) => next();

    registry.use(globalMw, { zone: 'pre', priority: 0 });
    registry.useFor(DummyController, ctrlMw, { zone: 'pre', priority: 1 });

    const global = registry.all('pre');
    const controller = registry.for(DummyController, 'pre');

    expect(global.map(e => e.use)).toContain(globalMw);
    expect(controller.map(e => e.use)).toContain(ctrlMw);
  });
});
