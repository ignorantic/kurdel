import type { ActionResult } from '@kurdel/core/http';
import {
  route,
  Controller,
  BadRequest,
  Conflict, 
  Forbidden,
  NotFound,
  NotImplemented,
  ServiceUnavailable,
  Unauthorized,
} from '@kurdel/core/http';

export class ErrorController extends Controller {
  readonly routes = {
    bad: route({ method: 'GET', path: '/bad' })(this.bad),
    boom: route({ method: 'GET', path: '/boom' })(this.boom),
    unauthorized: route({ method: 'GET', path: '/unauth' })(this.unauth),
    forbidden: route({ method: 'GET', path: '/forbid' })(this.forbid),
    notFound: route({ method: 'GET', path: '/missing' })(this.notFound),
    conflict: route({ method: 'GET', path: '/conflict' })(this.conflict),
    notImpl: route({ method: 'GET', path: '/todo' })(this.notImpl),
    svcUnavailable: route({ method: 'GET', path: '/svc' })(this.svcUnavailable),
  };

  async bad(): Promise<ActionResult> {
    throw BadRequest('Missing field', { field: 'name' });
  }

  async boom(): Promise<ActionResult> {
    throw new Error('Unexpected failure');
  }

  async unauth(): Promise<ActionResult> {
    throw Unauthorized('No token');
  }

  async forbid(): Promise<ActionResult> {
    throw Forbidden();
  }

  async notFound(): Promise<ActionResult> {
    throw NotFound('No such resource');
  }

  async conflict(): Promise<ActionResult> {
    throw Conflict('Already exists');
  }

  async notImpl(): Promise<ActionResult> {
    throw NotImplemented();
  }

  async svcUnavailable(): Promise<ActionResult> {
    throw ServiceUnavailable('Try later');
  }
}

