import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import request from 'supertest';

import { Ok } from 'src/api/http/http-results.js';
import { Controller } from 'src/api/http/controller.js';
import { HttpContext } from 'src/api/http/types.js';
import { HttpModule } from 'src/api/http/http-module.js';

import { route } from 'src/api/http/route.js';

import { createApplication } from 'src/facade/create-application.js';

class RootController extends Controller {
  readonly routes = {
    splash: route({ method: 'GET', path: '/' })(this.slash),
  };

  async slash() {
    return Ok({ case: 'slash' })
  }
}

class EmptyController extends Controller {
  readonly routes = {
    empty: route({ method: 'GET', path: '' })(this.empty),
  };

  async empty() {
    return Ok({ case: 'empty-string' })
  }
}

class PrefixedController extends Controller {
  readonly routes = {
    root: route({ method: 'GET', path: '/' })(this.root),
    withId: route({ method: 'GET', path: '/:id' })(this.withId),
  };

  async root() {
    return Ok({ case: 'prefixed-root' })
  }

  async withId(ctx: HttpContext) {
    return Ok({ case: 'prefixed-id', id: ctx.params.id })
  }
}

class TestHttpModule implements HttpModule {
  readonly providers = [];
  readonly controllers = [
    {
      use: RootController,
    },
    {
      use: EmptyController,
      prefix: '/empty',
    },
    {
      use: PrefixedController,
      prefix: '/users',
    },
  ];
  async register() {}
}

let server: Server;

describe('Router path edge cases', () => {
  beforeAll(async () => {
    const app = await createApplication({
      modules: [new TestHttpModule()],
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

  it('should match single slash path', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(200);
    expect(res.body.case).toBe('slash');
  });

  it('should match empty-string path', async () => {
    const res = await request(server).get('/empty');
    expect(res.status).toBe(200);
    expect(res.body.case).toBe('empty-string');
  });

  it('should match prefixed controller root', async () => {
    const res = await request(server).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.case).toBe('prefixed-root');
  });

  it('should match prefixed controller root with trailing slash', async () => {
    const res = await request(server).get('/users/');
    expect(res.status).toBe(200);
    expect(res.body.case).toBe('prefixed-root');
  });

  it('should match prefixed controller param', async () => {
    const res = await request(server).get('/users/42');
    expect(res.status).toBe(200);
    expect(res.body.case).toBe('prefixed-id');
    expect(res.body.id).toBe('42');
  });
});

