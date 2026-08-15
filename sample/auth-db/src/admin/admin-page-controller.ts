import { Controller, NotFound, route } from '@kurdel/core/http';
import type { TemplateEngine } from '@kurdel/core/template';

export class AdminPageController extends Controller<{ view: TemplateEngine }> {
  readonly routes = {
    index: route({ method: 'GET', path: '/', auth: { public: true } })(this.index),
    clientScript: route({ method: 'GET', path: '/client.js', auth: { public: true } })(this.script),
    clientStyles: route({ method: 'GET', path: '/client.css', auth: { public: true } })(
      this.styles
    ),
  };

  async index() {
    return this.render('admin', { title: 'Kurdel Auth Admin' });
  }

  async script() {
    throw NotFound('Asset not found');
  }

  async styles() {
    throw NotFound('Asset not found');
  }
}
