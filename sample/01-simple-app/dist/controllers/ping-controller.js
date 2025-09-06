import { Controller, route, } from '@kurdel/core';
export class PingController extends Controller {
    routes = {
        ping: route({ method: 'GET', path: '/' })(this.ping),
    };
    async ping(_ctx) {
        return { kind: 'json', status: 200, body: { message: 'OK' } };
    }
}
