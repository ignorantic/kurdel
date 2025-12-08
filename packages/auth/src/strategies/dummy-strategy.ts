import type { HttpRequest } from '@kurdel/common';

import type { AuthStrategy } from 'src/auth-strategy.js';

export class DummyStrategy implements AuthStrategy {
  async authenticate(req: HttpRequest) {
    const header = req.headers?.['x-auth'];
    if (header === 'ok') {
      return { id: 1, roles: ['admin'], name: 'TestUser' };
    }
    return null;
  }
}
