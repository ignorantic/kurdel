import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Application, IServerAdapter } from '@kurdel/core';
import { UserModule } from './user-module.js';

let app: Application;
let server: any;

describe('UserModule integration', () => {
  beforeAll(async () => {
    app = await Application.create({
      modules: [new UserModule()],
      db: false,
    });

    const adapter = app.getContainer().get(IServerAdapter);
    server = adapter.getHttpServer();
    app.listen(0, () => {});
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

