import { describe, it, expect } from 'vitest';
import http from 'http';
import { Controller } from 'src/controller.js';
import { route } from 'src/routing.js';
import { Ok } from 'src/http-results.js';

class ErrorAfterSendController extends Controller {
  readonly routes = {
    ok: route({ method: 'GET', path: '/ok' })(this.ok),
    boom: route({ method: 'GET', path: '/boom' })(this.boom),
  };

  async ok() {
    return Ok({ status: 'sent' });
  }

  async boom() {
    throw new Error('Simulated error');
  }
}

describe('Controller with headersSent', () => {
  const controller = new ErrorAfterSendController({});

  const makeRes = () => {
    const req = new http.IncomingMessage(null as any);
    const res = new http.ServerResponse(req);

    Object.defineProperty(res, 'headersSent', {
      value: true,
      configurable: true,
    });

    let body = '';
    res.write = ((chunk: any) => {
      body += chunk;
      return true;
    }) as any;

    return { req, res, getBody: () => body };
  };

  it('should NOT send error response if headersSent is true', async () => {
    const { req, res, getBody } = makeRes();

    await controller.execute(req, res, 'boom');

    expect(getBody()).toBe('');
    expect(res.statusCode).toBe(200);
  });
});

