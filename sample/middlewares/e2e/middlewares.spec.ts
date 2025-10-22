import request from 'supertest';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';

import { createNodeApplication } from '@kurdel/facade';
import type { Application } from '@kurdel/core/app';
import type { RunningServer } from '@kurdel/core/http';

import { LoggerModule } from '../src/modules/logger-module.js';
import { PostModule } from '../src/modules/post-module.js';
import { UserModule } from '../src/modules/user-module.js';

describe('E2E: Authorization middleware with logging', () => {
  let app: Application;
  let server: RunningServer;
  let rawServer: Server;

  beforeAll(async () => {
    app = await createNodeApplication({
      modules: [new LoggerModule(), new PostModule(), new UserModule()],
      db: false,
    });
    server = app.listen(0);
    rawServer = server.raw?.<Server>() as Server;
    if (!rawServer) throw new Error('Server not started');
  });

  afterAll(async () => {
    await server.close();
  });

  it('allows access without Authorization header', async () => {
    const res = await request(rawServer).get('/posts/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'Lem is genius!', body: 'Yep, he is!' });
  });

  it('denies access without Authorization header (401 Unauthorized)', async () => {
    const res = await request(rawServer).get('/users');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('allows access with Authorization header', async () => {
    const res = await request(rawServer)
      .get('/users/1')
      .set('Authorization', 'yes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'Tarantoga' });
  });
  
  it('logs request summary with Authorization header', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await request(rawServer)
      .get('/users/3')
      .set('Authorization', 'yes');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/users\/3 -> 200 \(\d+ms\)$/)
    );

    logSpy.mockClear();
  });
  
  it('logs request summary without Authorization header', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await request(rawServer)
      .get('/posts')
      .set('Authorization', 'yes');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/posts -> 200 \(\d+ms\)$/)
    );

    logSpy.mockClear();
  });
});
