import { Controller, route, type HttpContext } from '@kurdel/core/http';
import type { TemplateEngine } from '@kurdel/core/template';

export class HelloController extends Controller<{ view: TemplateEngine }> {
  readonly routes = {
    home: route({ method: 'GET', path: '/' })(this.home),
    user: route({ method: 'GET', path: '/user/:id' })(this.user),
  };

  async home() {
    return this.render('home', {
      title: 'Kurdel + React',
      message: 'Welcome to React-powered templates!',
    });
  }

  async user(ctx: HttpContext) {
    const user = { id: ctx.params.id, name: 'Ada Lovelace' };
    return this.render('user', {
      title: 'Kurdel + React',
      user,
    });
  }
}
