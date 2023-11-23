import { Controller } from 'ijon';
export class HomeController extends Controller {
    routes = [
        {
            method: 'GET',
            path: '/',
            action: 'index',
        }
    ];
    async index() {
        this.send(200, { message: 'Hello, world!' });
    }
}
