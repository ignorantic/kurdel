import { Controller, RouteConfig } from 'ijon';

export class HomeController extends Controller<HomeController> {
  routes: RouteConfig<HomeController> = [
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
    this.send(200, { message: 'About'});
  }
}
