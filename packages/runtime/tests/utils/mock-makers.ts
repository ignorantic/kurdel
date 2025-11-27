import { vi } from 'vitest';

import type { ActionResult, ControllerConfig, MiddlewareRegistry, MiddlewareZone } from '@kurdel/core/http';
import type { HttpResponse } from '@kurdel/common';

/*──────────────────────────────────────────────────────────
 * Router
 *──────────────────────────────────────────────────────────*/

const defaultMatch = async (_req: any, res: any) => {
  // Simulate a successful handler
  res.statusCode = 204;
  res.end();
}

export function makeMockRouter(match: any = defaultMatch) {
  return {
    init: vi.fn(),
    resolve: vi.fn().mockReturnValue(match),
  };
}

/*──────────────────────────────────────────────────────────
 * Controller Configs
 *──────────────────────────────────────────────────────────*/

export function makeMockControllerConfigs(): ControllerConfig[] {
  return [];
}

/*──────────────────────────────────────────────────────────
 * Response Renderer
 *──────────────────────────────────────────────────────────*/

export function makeMockRenderer() {
  return {
    render: vi.fn((res: HttpResponse, result: ActionResult) => {
      res.sent = true;
      res.send?.(JSON.stringify(result));
    }),
    handleError: vi.fn((res: HttpResponse, err: any) => {
      res.sent = true;
      res.send?.(JSON.stringify({ error: err.message ?? 'err' }));
    }),
    handleValidationError: vi.fn(),
  };
}

/*──────────────────────────────────────────────────────────
 * Controller Resolver
 *──────────────────────────────────────────────────────────*/

export function makeMockControllerResolver() {
  return {};
}

/*──────────────────────────────────────────────────────────
 * Server Adapter
 *──────────────────────────────────────────────────────────*/

export function makeMockAdapter(
  onRequest?: (req: any, res: any) => void
) {
  return {
    on: vi.fn((cb: (req: any, res: any) => void | Promise<void>) => {
      const req = { method: 'GET', url: '/' };
      const res = { end: vi.fn(), setHeader: vi.fn(), statusCode: 0 };

      // If custom request handler provided — call it
      if (onRequest) {
        onRequest(req, res);
      } else {
        // Otherwise just invoke adapter callback once
        cb(req, res);
      }
    }),
    listen: vi.fn(),
    close: vi.fn(),
  };
}
