import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import request from 'supertest';

import { createApplication } from '@kurdel/core';

import { UserModule } from './user-module.js';

let server: Server;

describe('UserModule integration', () => {
  beforeAll(async () => {
    const app = await createApplication({
      modules: [new UserModule()],
      db: false,
    });

    const runningServer = app.listen(0, () => {});
    if (!runningServer.raw) throw new Error('Node server not available for this adapter');
    server = runningServer.raw() as Server;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('GET /users should return list', async () => {
    const res = await request(server).get('/users');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Alice');
  });

  it('POST /users should create user', async () => {
    const res = await request(server).post('/users').send({ name: 'Bob' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bob');
  });
});

