import { Controller } from 'ijon';

export class HomeController extends Controller {
  async index() {
    this.send(200, { message: 'Hello, world!' });
  }

  async about() {
    this.send(200, { message: 'About'});
  }
}
