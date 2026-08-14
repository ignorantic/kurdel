import {
  BadRequest,
  Controller,
  Created,
  NotFound,
  Ok,
  route,
  type HttpContext,
  type RouteParams,
} from '@kurdel/core/http';
import { z } from 'zod';

import {
  DatabaseUserService,
  UnknownRolesError,
  type CreateUserInput,
} from './database-user-service.js';
import {
  ActiveUserNotFoundError,
  DatabaseApiKeyService,
} from './database-api-key-service.js';
import { zodAdapter } from './zod-adapter.js';

type Deps = {
  users: DatabaseUserService;
  apiKeys: DatabaseApiKeyService;
};

type CreateApiKeyBody = {
  name: string;
  expiresAt?: string;
};

const createUserSchema = z.object({
  roles: z.array(z.string().trim().min(1)).min(1).max(10)
    .refine(roles => new Set(roles).size === roles.length, 'Roles must be unique'),
});

const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z.string().datetime().optional().refine(
    value => !value || new Date(value).getTime() > Date.now(),
    'Expiration must be in the future'
  ),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
});

export class AuthDbController extends Controller<Deps> {
  readonly routes = {
    home: route({ method: 'GET', path: '/public', auth: { public: true } })(this.home),
    profile: route({ method: 'GET', path: '/profile', auth: { strategy: 'api-key' } })(this.profile),
    admin: route({
      method: 'GET',
      path: '/admin',
      auth: { strategy: 'api-key', roles: ['admin'] },
    })(this.admin),
    createUser: route({
      method: 'POST',
      path: '/users',
      auth: { strategy: 'api-key', roles: ['admin'] },
      schema: { body: zodAdapter(createUserSchema) },
    })(this.createUser),
    createApiKey: route({
      method: 'POST',
      path: '/users/:id/api-keys',
      auth: { strategy: 'api-key', roles: ['admin'] },
      schema: {
        body: zodAdapter(createApiKeySchema),
        params: zodAdapter(userIdSchema),
      },
    })(this.createApiKey),
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

  async createUser(ctx: HttpContext<CreateUserInput>) {
    try {
      const user = await this.deps.users.create(ctx.body!);
      return Created({
        id: user.id,
        status: user.status,
        roles: user.roles,
      });
    } catch (error) {
      if (error instanceof UnknownRolesError) {
        throw BadRequest(error.message, { roles: error.roles });
      }
      throw error;
    }
  }

  async createApiKey(
    ctx: HttpContext<CreateApiKeyBody, RouteParams<'/users/:id/api-keys'>>
  ) {
    try {
      const credential = await this.deps.apiKeys.create({
        userId: Number(ctx.params.id),
        name: ctx.body!.name,
        expiresAt: ctx.body!.expiresAt ? new Date(ctx.body!.expiresAt) : undefined,
      });
      return Created({
        id: credential.id,
        key: credential.key,
        name: credential.name,
        expiresAt: credential.expiresAt,
      });
    } catch (error) {
      if (error instanceof ActiveUserNotFoundError) throw NotFound(error.message);
      throw error;
    }
  }

  private serializeUser(ctx: HttpContext) {
    return ctx.user ? { id: ctx.user.id, roles: ctx.user.roles } : null;
  }
}
