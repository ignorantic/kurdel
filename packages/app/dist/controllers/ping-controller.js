import { Controller } from 'ijon';
export class PingController extends Controller {
    routes = [
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
