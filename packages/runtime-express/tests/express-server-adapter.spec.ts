import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

import type { HttpRequest } from '@kurdel/common';

import { ExpressServerAdapter } from 'src/express-server-adapter.js';
import { adaptExpressRequest } from 'src/express-req-res-adapters.js';

describe('ExpressServerAdapter', () => {
  let adapter: ExpressServerAdapter;
  let server: express.Express;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    adapter = new ExpressServerAdapter();
    server = (adapter as any).app; // underlying Express app
  });

  afterEach(async () => {
    await adapter.close?.();
    consoleErrorSpy?.mockRestore();
  });

  it('should respond with JSON and status 200', async () => {
    adapter.on(async (req, res) => {
      res.status(200).json({ message: 'Hello from Express adapter' });
    });

    const res = await request(server).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Hello from Express adapter');
  });

  it('should adapt Express Request into HttpRequest correctly', async () => {
    const app = express();
    app.use(express.json());
    let captured: HttpRequest | null = null;

    app.post('/foo/:id', (req, res) => {
      captured = adaptExpressRequest(req);
      res.sendStatus(204);
    });

    await request(app).post('/foo/42?debug=true').set('X-Custom', 'abc').send({ name: 'Alice' });

    expect(captured).not.toBeNull();
    expect(captured!.method).toBe('POST');
    expect(captured!.params.id).toBe('42');
    expect(captured!.query.debug).toBe('true');
    expect(captured!.body).toEqual({ name: 'Alice' });
    expect(captured!.headers['x-custom']).toBe('abc');
  });

  it('should handle errors gracefully', async () => {
    // 🔇 silence console.error only for this test
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const handler = vi.fn(async () => {
      throw new Error('Boom');
    });
    adapter.on(handler);

    const res = await request(server).get('/error');
    expect(res.status).toBe(500);
    expect(res.text).toContain('Internal Server Error');
  });

  it('should allow redirect responses', async () => {
    adapter.on(async (_req, res) => {
      res.redirect(302, '/next');
    });

    const res = await request(server).get('/go');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/next');
  });
});
