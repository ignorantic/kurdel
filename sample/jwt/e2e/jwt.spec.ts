import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import type { Server } from 'http';

import { createNodeApplication } from '@kurdel/facade';
import { AUTH_TOKENS, AuthModule, JwtStrategy } from '@kurdel/auth';
import type { RunningServer } from '@kurdel/core/http';

import { JwtAuthModule } from '../src/jwt-auth-module.js';

describe('Sample JWT Application — E2E', () => {
  let agent: any;
  let server: RunningServer;
  let rawServer: Server;

  // ─────────────────────────────────────────────
  // Test data
  // ─────────────────────────────────────────────

  const tokens = {
    root:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZXMiOlsicm9vdCJdLCJpYXQiOjE3NjY5ODUwMTcsImlzcyI6Imt1cmRlbCIsImF1ZCI6InNhbXBsZS1qd3QifQ.L0ICN65YhzvO-GH-PvgFgXDk5W6hTugUAad5Z10WkTc',
    admin:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2OTg1MDE3LCJpc3MiOiJrdXJkZWwiLCJhdWQiOiJzYW1wbGUtand0In0.RwxU26d8yUC8TmMPcEvRtm2y9G_R6qvJx70CDR2z__c',
    user:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE3NjY5ODUwMTcsImlzcyI6Imt1cmRlbCIsImF1ZCI6InNhbXBsZS1qd3QifQ.pecp0dkQcvRK6LqykKJ5ha5qVL0KDPVEx8SNHfsGFuA',
    guest:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Iiwicm9sZXMiOlsiZ3Vlc3QiXSwiaWF0IjoxNzY2OTg1MDE3LCJpc3MiOiJrdXJkZWwiLCJhdWQiOiJzYW1wbGUtand0In0.BXAzIAwoHJABR4zQ7V0cMi3-f-smlTrMkQxcWmpUYus',
  };

  // ─────────────────────────────────────────────
  // App lifecycle
  // ─────────────────────────────────────────────

  beforeAll(async () => {
    const app = await createNodeApplication({
      db: false,
      modules: [
        new AuthModule({
          strategies: [
            {
              name: 'jwt',
              useFactory: (c) =>
                new JwtStrategy(
                  c.get(AUTH_TOKENS.JwtService),
                  c.get(AUTH_TOKENS.JwtRepository),
                ),
            },
          ],
        }),
        new JwtAuthModule(),
      ],
    });

    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });

    rawServer = server.raw?.<Server>() as Server;
    if (!rawServer) throw new Error('Server not started');

    agent = request(rawServer);
  });

  afterAll(async () => {
    await server.close();
  });

  // ─────────────────────────────────────────────
  // Tests
  // ─────────────────────────────────────────────

  it('GET /public → no token required', async () => {
    const res = await agent.get('/home');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /secure → missing token → 401', async () => {
    const res = await agent.get('/secure/system');
    expect(res.status).toBe(401);
  });

  it('GET /secure → user token → 403', async () => {
    const res = await agent
      .get('/secure/system')
      .set('Authorization', `Bearer ${tokens.user}`);

    expect(res.status).toBe(403);
  });

  it('GET /secure → admin token → 403', async () => {
    const res = await agent
      .get('/secure/system')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(403);
  });

  it('GET /secure → root token → 200', async () => {
    const res = await agent
      .get('/secure/system')
      .set('Authorization', `Bearer ${tokens.root}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('1');
    expect(res.body.user.roles).toContain('root');
  });

  it('GET /secure/login → public even under secure controller', async () => {
    const res = await agent.get('/secure/login');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBeTruthy();
  });
});
