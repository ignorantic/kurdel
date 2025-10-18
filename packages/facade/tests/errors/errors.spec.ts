import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Server } from 'http';

import { createNodeApplication } from 'src/create-node-application.js';

import { ErrorModule } from './error-module.js';

let server: Server;

describe('Centralized error handling', () => {
  beforeAll(async () => {
    // silence console.error for clean test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const app = await createNodeApplication({
      modules: [new ErrorModule()],
      db: false,
    });
    const runningServer = app.listen(0, () => {});
    if (!runningServer.raw) throw new Error('Node server not available for this adapter');
    server = runningServer.raw() as Server;
  });

  afterAll(async () => {
    if (server) server.close();
    (console.error as any).mockRestore();
  });

  it('should map HttpError to JSON', async () => {
    const res = await request(server).get('/err/bad');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing field');
    expect(res.body.details).toEqual({ field: 'name' });
  });

  it('should map generic Error to 500', async () => {
    const res = await request(server).get('/err/boom');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });

  it.each([
    ['/err/unauth', 401, 'No token'],
    ['/err/forbid', 403, 'Forbidden'],
    ['/err/missing', 404, 'No such resource'],
    ['/err/conflict', 409, 'Already exists'],
    ['/err/todo', 501, 'Not Implemented'],
    ['/err/svc', 503, 'Try later'],
  ])('should handle %s → %d', async (path, status, msg) => {
    const res = await request(server).get(path);
    expect(res.status).toBe(status);
    expect(res.body.error).toBe(msg);
  });
});
