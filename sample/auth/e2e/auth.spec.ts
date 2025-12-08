import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Server } from 'http';

import { createNodeApplication } from '@kurdel/facade';
import { ApiKeyStrategy, AuthModule } from '@kurdel/auth';
import type { Application } from '@kurdel/core/app';
import type { RunningServer } from '@kurdel/core/http';

import { DemoAuthModule } from '../src/demo-auth-module.js';

/**
 * E2E test suite for sample-auth application.
 *
 * Covers:
 *  1️⃣ Public controllers (no auth required)
 *  2️⃣ Mixed controllers: public + protected routes
 *  3️⃣ Secure controller with controller-level auth
 *  4️⃣ Various API keys and role-based access
 */

let agent: any;
let server: RunningServer;
let rawServer: Server;

describe('Sample Auth Application — E2E', () => {
  beforeAll(async () => {
    const application = await createNodeApplication({
      db: false,
      modules: [
        new AuthModule({
          strategies: [{
            name: 'api-key',
            use: new ApiKeyStrategy({
              header: 'x-api-key',
              keys: {
                'svc-999': { id: 1, roles: ['root'] },
                'dev-123': { id: 2, roles: ['admin'] },
                'pub-777': { id: 3, roles: ['user'] },
                'pub-888': { id: 4, roles: ['guest'] },
              },
            }),
          }],
        }),
        new DemoAuthModule(),
      ],
    });

    server = await new Promise(resolve => {
      const s = application.listen(0, () => resolve(s));
    });

    rawServer = server.raw?.<Server>() as Server;
    if (!rawServer) throw new Error('Server not started');

    agent = request(rawServer);
  });

  afterAll(async () => {
    server?.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1️⃣ PUBLIC CONTROLLER
  // ─────────────────────────────────────────────────────────────

  it('GET /home → public, no auth needed', async () => {
    const res = await agent.get('/home');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  // ─────────────────────────────────────────────────────────────
  // 2️⃣ MIXED CONTROLLER
  // ─────────────────────────────────────────────────────────────

  it('GET /mixed/public → public route, no auth needed', async () => {
    const res = await agent.get('/mixed/public');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /mixed/secure → requires admin, missing key → 401', async () => {
    const res = await agent.get('/mixed/secure');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('GET /mixed/secure → wrong role (user) → 403', async () => {
    const res = await agent
      .get('/mixed/secure')
      .set('x-api-key', 'pub-777'); // roles: ['user']

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it('GET /mixed/secure → admin key → OK', async () => {
    const res = await agent
      .get('/mixed/secure')
      .set('x-api-key', 'dev-123'); // roles: ['admin']

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.roles).toContain('admin');
  });

  // ─────────────────────────────────────────────────────────────
  // 3️⃣ SECURE CONTROLLER (controller-level auth)
  // ─────────────────────────────────────────────────────────────

  it('GET /secure/login → public route, no key → OK', async () => {
    const res = await agent.get('/secure/login');
    expect(res.status).toBe(200);
  });

  it('GET /secure/system → requires root, no key → 401', async () => {
    const res = await agent.get('/secure/system');
    expect(res.status).toBe(401);
  });

  it('GET /secure/system → wrong role (admin) → 403', async () => {
    const res = await agent
      .get('/secure/system')
      .set('x-api-key', 'dev-123'); // admin

    expect(res.status).toBe(403);
  });

  it('GET /secure/system → root → OK', async () => {
    const res = await agent
      .get('/secure/system')
      .set('x-api-key', 'svc-999'); // root

    expect(res.status).toBe(200);
    expect(res.body.user.roles).toContain('root');
  });
});
