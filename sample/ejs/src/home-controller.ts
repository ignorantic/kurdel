import type { RouteConfig, ActionResult } from '@kurdel/core/http';
import { Controller, route } from '@kurdel/core/http';

export class HomeController extends Controller {
  readonly routes: RouteConfig = {
    home: route({ method: 'GET', path: '/' })(this.home),
    about: route({ method: 'GET', path: '/about' })(this.about),
    docs: route({ method: 'GET', path: '/docs' })(this.docs),
  };

  async home(): Promise<ActionResult> {
    return this.render('home.ejs');
  }

  async about(): Promise<ActionResult> {
    return this.render('about.ejs');
  }

  async docs(): Promise<ActionResult> {
    return this.render('docs.ejs');
  }
}
