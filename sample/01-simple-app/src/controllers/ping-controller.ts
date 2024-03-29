import { Controller, RouteConfig } from '@kurdel/core';

export class PingController extends Controller<PingController> {
  routes: RouteConfig<PingController> = [
    {
      method: 'GET',
      path: '/',
      action: 'ping',
    }
  ];

  async ping() {
    this.send(200, { message: 'OK' });
  }
}
