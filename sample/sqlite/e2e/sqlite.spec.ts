import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';

import { createNodeApplication } from '@kurdel/facade';
import type { Application } from '@kurdel/core/app';
import type { RunningServer } from '@kurdel/core/http';

import { UserModule } from '../src/user-module.js';

describe('E2E: working with sqlite database', () => {
  let app: Application;
  let server: RunningServer;
  let rawServer: Server;

  beforeAll(async () => {
    app = await createNodeApplication({
      modules: [new UserModule()],
    });
    server = app.listen(0);
    rawServer = server.raw?.<Server>() as Server;
    if (!rawServer) throw new Error('Server not started');
  });

  afterAll(async () => {
    await server.close();
  });
  
  it('return response with status 200', async () => {
    const res = await request(rawServer)
      .get('/users')

    expect(res.status).toBe(200);
  });
});
