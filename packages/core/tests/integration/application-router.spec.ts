import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Application } from '../../src/application.ts';
import { IServerAdapter } from '../../src/http/interfaces.ts';
import { NativeHttpServerAdapter } from '../../src/http/native-http-server-adapter.ts';
import { UserController } from './utils/user-controller.ts';
import { LoggerMiddleware } from './utils/logger-middleware.ts';

let app: Application;
let server: any;

describe('Application + Router integration', () => {
  beforeAll(async () => {
    app = await Application.create({
      db: false,
      controllers: [{
        use: UserController,
      }],
      middlewares: [LoggerMiddleware],
    });

    const adapter = app.getContainer().get(IServerAdapter);
    server = adapter.getHttpServer();
    adapter.listen(0, () => {});
  });

  afterAll(async () => {
    server.close();
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

  it('GET /users/error should return 500', async () => {
    const res = await request(server).get('/users/error');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});

