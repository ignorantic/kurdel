import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
} from '@kurdel/core';

export class PingController extends Controller<{}> {
  readonly routes: RouteConfig<{}> = {
    ping: route({ method: 'GET', path: '/' })(this.ping),
  };

  async ping(_ctx: HttpContext<{}>): Promise<ActionResult> {
    return { kind: 'json', status: 200, body: { message: 'OK' } };
  }
}
