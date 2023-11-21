import { Controller } from 'ijon';
export class HomeController extends Controller {
    routes = [
        {
            method: 'GET',
            path: '/',
            action: 'index',
        },
        {
            method: 'GET',
            path: '/about',
            action: 'about',
        }
    ];
    async index() {
        this.send(200, { message: 'Hello, world!' });
    }
    async about() {
        this.send(200, { message: 'About' });
    }
}
