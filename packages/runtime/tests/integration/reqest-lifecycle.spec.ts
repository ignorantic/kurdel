import { describe, it, expect, vi } from 'vitest';
import type { Method, ControllerConfig } from '@kurdel/core/http';

import { RuntimeRouter } from 'src/http/runtime-router.js';
import { RuntimeRequestOrchestrator } from 'src/http/runtime-request-orchestrator.js';

import { FakeContainer } from './fake-container.js';
import { FakeResolver } from './fake-resolver.js';
import { FakeController } from './fake-controller.js';
import { FakeResponseRenderer } from './fake-response-renderer.js';

function makeEnvironment(configs: ControllerConfig[] = []) {
  const root = new FakeContainer();
  const resolver = new FakeResolver(root);
  const renderer = new FakeResponseRenderer();
  const router = new RuntimeRouter();

  // Temporary root controller for route compilation
  root.set(FakeController as any, new FakeController({ tag: 'root', calls: [] }));

  // Initialize router with controller metadata
  router.init(resolver, configs);

  // No global middlewares for now
  const orchestrator = new RuntimeRequestOrchestrator(router, renderer, []);
  return { router, renderer, orchestrator, root };
}

describe('RuntimeRouter + RuntimeRequestOrchestrator', () => {
  it('resolves controller from provided scope and executes action', async () => {
    const configs: ControllerConfig[] = [{ use: FakeController, prefix: '' }];
    const { orchestrator, root } = makeEnvironment(configs);

    // Prepare per-request scope
    const scope = root.createScope();
    const calls: string[] = [];
    scope.set(FakeController as any, new FakeController({ tag: 'scopeA', calls }));

    const req: any = { method: 'GET', url: '/ping/42' };
    const res: any = {
      statusCode: 0,
      sent: false,
      json: vi.fn(),
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(body: any) {
        this.body = body;
        this.sent = true;
        return this;
      },
    };

    await orchestrator.execute(req, res, scope);

    // Controller from the scope should be used
    expect(calls).toContain('ping:42:scopeA');

    // Renderer must have produced a 200 JSON result
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it('returns 404 for unknown routes', async () => {
    const { orchestrator, root } = makeEnvironment([{ use: FakeController }]);
    const scope = root.createScope();

    const req: any = { method: 'GET', url: '/unknown' };
    const res: any = {
      statusCode: 0,
      sent: false,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(body?: any) {
        this.sent = true;
        this.body = body ?? '';
        return this;
      },
      json() {
        return this;
      },
    };

    await orchestrator.execute(req, res, scope);

    expect(res.statusCode).toBe(404);
    expect(res.sent).toBe(true);
    expect(res.body).toContain('Not Found');
  });

  it('extracts path params into context and passes them to controller', async () => {
    const { orchestrator, root } = makeEnvironment([{ use: FakeController }]);
    const calls: string[] = [];
    const scope = root.createScope();
    scope.set(FakeController as any, new FakeController({ tag: 'S', calls }));

    const req: any = { method: 'GET', url: '/ping/abc' };
    const res: any = {
      statusCode: 0,
      sent: false,
      json: vi.fn(),
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(body: any) {
        this.body = body;
        this.sent = true;
        return this;
      },
    };

    await orchestrator.execute(req, res, scope);

    // Verifies that route params were parsed and used in controller logic
    expect(calls[0]).toBe('ping:abc:S');
  });
});
