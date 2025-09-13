import { describe, it, expect, vi } from 'vitest';
import { Application } from '../../src/application.js';
import { MiddlewareRegistry } from '../../src/middleware-registry.js';
import { IServerAdapter } from '../../src/http/interfaces.js';
import { Router } from '../../src/router.js';
import { Controller } from '../../src/controller.js';
import { route } from '../../src/routing.js';
import type { HttpContext, ActionResult } from '../../src/types.js';

describe('Application', () => {
  it('should create application without errors', async () => {
    const app = await Application.create({ db: false });
    expect(app).toBeInstanceOf(Application);
  });

  it('should register a service', async () => {
    class MyService {}
    const app = await Application.create({ db: false, services: [MyService] });

    const resolved = app.getContainer().get(MyService);
    expect(resolved).toBeInstanceOf(MyService);
  });

  it('should register global middleware', async () => {
    const mw = vi.fn(async (ctx, next) => next());
    const app = await Application.create({ db: false, middlewares: [mw] });
    const registry = app.getContainer().get(MiddlewareRegistry);

    expect(registry.all()).toEqual(expect.arrayContaining([mw]));
  });

  it('should register controller and resolve route', async () => {
    class TestController extends Controller<{}> {
      readonly routes = {
        index: route({ method: 'GET', path: '/' })(this.index),
      };
      async index(ctx: HttpContext<{}>): Promise<ActionResult> {
        return { kind: 'json', status: 200, body: { ok: true } };
      }
    }

    const app = await Application.create({
      db: false,
      controllers: [{ use: TestController }],
    });

    const router = app.getContainer().get(Router);
    const handler = router.resolve('GET', '/');

    expect(handler).toBeInstanceOf(Function);
  });

  it('should call server.listen when app.listen is invoked', async () => {
    class FakeServer implements IServerAdapter {
        listen = vi.fn();
    }

    const app = await Application.create({ db: false, server: FakeServer });
    app.listen(3000, () => {});
    const server = app.getContainer().get<IServerAdapter>(IServerAdapter);

    expect(server.listen).toHaveBeenCalled();
    expect(server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
