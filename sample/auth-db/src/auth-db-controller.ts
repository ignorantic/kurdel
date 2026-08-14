import { Controller, Ok, route, type HttpContext } from '@kurdel/core/http';

export class AuthDbController extends Controller {
  readonly routes = {
    home: route({ method: 'GET', path: '/public', auth: { public: true } })(this.home),
    profile: route({ method: 'GET', path: '/profile', auth: { strategy: 'api-key' } })(this.profile),
    admin: route({
      method: 'GET',
      path: '/admin',
      auth: { strategy: 'api-key', roles: ['admin'] },
    })(this.admin),
  };

  async home() {
    return Ok({ message: 'Public route' });
  }

  async profile(ctx: HttpContext) {
    return Ok({ user: this.serializeUser(ctx) });
  }

  async admin(ctx: HttpContext) {
    return Ok({ message: 'Admin access granted', user: this.serializeUser(ctx) });
  }

  private serializeUser(ctx: HttpContext) {
    return ctx.user ? { id: ctx.user.id, roles: ctx.user.roles } : null;
  }
}
