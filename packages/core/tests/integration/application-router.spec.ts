import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Application, IServerAdapter } from '@kurdel/core';
import { UserController } from './utils/user-controller.ts';
import { LoggerMiddleware } from './utils/logger-middleware.ts';

let app: Application;
let server: any;

describe('Application + Router integration', () => {
  beforeAll(async () => {
    app = await Application.create({
      controllers: [
        { use: UserController },
      ],
      middlewares: [LoggerMiddleware],
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
    expect(res.headers['x-logged']).toBe('true');
  });

  it('POST /users should create user', async () => {
    const res = await request(server).post('/users').send({ name: 'Bob' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bob');
    expect(res.headers['x-logged']).toBe('true');
  });

  it('GET /users/error should return 400 via BadRequest', async () => {
    const res = await request(server).get('/users/error');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad request test');
  });
});

