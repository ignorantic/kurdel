import {
  BadRequest,
  Conflict,
  Controller,
  Created,
  NoContent,
  NotFound,
  Ok,
  Unauthorized,
  route,
  type HttpContext,
  type RouteParams,
} from '@kurdel/core/http';
import type { JwtService, PasswordAuthenticationService } from '@kurdel/auth';
import { z } from 'zod';

import {
  ActiveUserNotFoundError,
  ApiKeyNotFoundError,
  ApiKeyUserNotFoundError,
  DuplicateUserEmailError,
  PasswordUserNotFoundError,
  UnknownRolesError,
  UnknownPermissionsError,
  RoleNotFoundError,
  UserNotFoundError,
  type CreateUserInput,
  type DatabaseApiKeyService,
  type DatabaseAuthEventStore,
  type DatabaseJwtSessionService,
  type DatabasePasswordService,
  type DatabaseUserService,
  type UpdateUserInput,
} from '@kurdel/auth-db';
import { zodAdapter } from './zod-adapter.js';

type Deps = {
  users: DatabaseUserService;
  apiKeys: DatabaseApiKeyService;
  events: DatabaseAuthEventStore;
  passwords: DatabasePasswordService;
  passwordAuthentication: PasswordAuthenticationService;
  jwtSessions: DatabaseJwtSessionService;
  jwt: JwtService;
};

type LoginBody = { email: string; password: string };

type CreateApiKeyBody = {
  name: string;
  expiresAt?: string;
};

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(1024),
});

const setPasswordSchema = z.object({
  password: z.string().min(8).max(1024),
});

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  roles: z
    .array(z.string().trim().min(1))
    .min(1)
    .max(10)
    .refine(roles => new Set(roles).size === roles.length, 'Roles must be unique'),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().max(254).optional(),
    status: z.enum(['active', 'disabled']).optional(),
    roles: z
      .array(z.string().trim().min(1))
      .min(1)
      .max(10)
      .refine(roles => new Set(roles).size === roles.length, 'Roles must be unique')
      .optional(),
  })
  .refine(input => Object.keys(input).length > 0, 'At least one field is required');

const listUsersSchema = z.object({
  limit: z
    .string()
    .regex(/^([1-9]|[1-9]\d|100)$/, 'Limit must be between 1 and 100')
    .optional(),
  offset: z.string().regex(/^\d+$/, 'Offset must be a non-negative integer').optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

const authEventTypes = [
  'authentication.succeeded',
  'authentication.failed',
  'authorization.denied',
  'api-key.issued',
  'api-key.revoked',
  'jwt-session.created',
  'jwt-session.revoked',
] as const;

const listAuthEventsSchema = z.object({
  type: z.enum(authEventTypes).optional(),
  limit: z
    .string()
    .regex(/^([1-9]|[1-9]\d|100)$/, 'Limit must be between 1 and 100')
    .optional(),
});

const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .refine(
      value => !value || new Date(value).getTime() > Date.now(),
      'Expiration must be in the future'
    ),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
});

const roleIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Role ID must be numeric'),
});

const rolePermissionsSchema = z.object({
  permissions: z.array(z.string().trim().min(1)).max(100),
});

const apiKeyParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
  keyId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'API key ID is invalid'),
});

export class AuthDbController extends Controller<Deps> {
  readonly routes = {
    home: route({ method: 'GET', path: '/public', auth: { public: true } })(this.home),
    login: route({
      method: 'POST',
      path: '/auth/login',
      auth: { public: true },
      schema: { body: zodAdapter(loginSchema) },
    })(this.login),
    sessionProfile: route({
      method: 'GET',
      path: '/session/profile',
      auth: { strategy: 'jwt' },
    })(this.profile),
    profile: route({ method: 'GET', path: '/profile', auth: { strategy: 'api-key' } })(
      this.profile
    ),
    admin: route({
      method: 'GET',
      path: '/admin',
      auth: { strategy: 'api-key', roles: ['admin'] },
    })(this.admin),
    listRoles: route({
      method: 'GET',
      path: '/roles',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
    })(this.listRoles),
    listPermissions: route({
      method: 'GET',
      path: '/permissions',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
    })(this.listPermissions),
    setRolePermissions: route({
      method: 'PUT',
      path: '/roles/:id/permissions',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: {
        body: zodAdapter(rolePermissionsSchema),
        params: zodAdapter(roleIdSchema),
      },
    })(this.setRolePermissions),
    createUser: route({
      method: 'POST',
      path: '/users',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { body: zodAdapter(createUserSchema) },
    })(this.createUser),
    listUsers: route({
      method: 'GET',
      path: '/users',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { query: zodAdapter(listUsersSchema) },
    })(this.listUsers),
    getUser: route({
      method: 'GET',
      path: '/users/:id',
      auth: { strategy: 'api-key', policies: ['view-user'] },
      schema: { params: zodAdapter(userIdSchema) },
    })(this.getUser),
    listAuthEvents: route({
      method: 'GET',
      path: '/users/:id/auth-events',
      auth: { strategy: 'api-key', policies: ['view-user'] },
      schema: {
        params: zodAdapter(userIdSchema),
        query: zodAdapter(listAuthEventsSchema),
      },
    })(this.listAuthEvents),
    updateUser: route({
      method: 'PATCH',
      path: '/users/:id',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: {
        body: zodAdapter(updateUserSchema),
        params: zodAdapter(userIdSchema),
      },
    })(this.updateUser),
    setPassword: route({
      method: 'PUT',
      path: '/users/:id/password',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { body: zodAdapter(setPasswordSchema), params: zodAdapter(userIdSchema) },
    })(this.setPassword),
    deleteUser: route({
      method: 'DELETE',
      path: '/users/:id',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { params: zodAdapter(userIdSchema) },
    })(this.deleteUser),
    createApiKey: route({
      method: 'POST',
      path: '/users/:id/api-keys',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: {
        body: zodAdapter(createApiKeySchema),
        params: zodAdapter(userIdSchema),
      },
    })(this.createApiKey),
    listApiKeys: route({
      method: 'GET',
      path: '/users/:id/api-keys',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { params: zodAdapter(userIdSchema) },
    })(this.listApiKeys),
    revokeApiKey: route({
      method: 'DELETE',
      path: '/users/:id/api-keys/:keyId',
      auth: { strategy: 'api-key', policies: ['manage-users'] },
      schema: { params: zodAdapter(apiKeyParamsSchema) },
    })(this.revokeApiKey),
  };

  async home() {
    return Ok({ message: 'Public route' });
  }

  async login(ctx: HttpContext<LoginBody>) {
    const user = await this.deps.passwordAuthentication.authenticate(
      ctx.body!.email,
      ctx.body!.password
    );
    if (!user) {
      await this.deps.events.report({
        type: 'authentication.failed',
        occurredAt: new Date(),
        strategy: 'password',
        reason: 'invalid-credential',
      });
      throw Unauthorized('Invalid email or password');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const session = await this.deps.jwtSessions.create(Number(user.id), expiresAt);
    const accessToken = this.deps.jwt.sign({
      sub: user.id,
      roles: user.roles,
      jti: session.id,
    });
    await this.deps.events.report({
      type: 'authentication.succeeded',
      occurredAt: new Date(),
      strategy: 'password',
      userId: user.id,
    });
    return Ok({ accessToken, tokenType: 'Bearer', expiresAt: session.expiresAt });
  }

  async profile(ctx: HttpContext) {
    return Ok({ user: this.serializeUser(ctx) });
  }

  async admin(ctx: HttpContext) {
    return Ok({ message: 'Admin access granted', user: this.serializeUser(ctx) });
  }

  async listRoles() {
    return Ok({ roles: await this.deps.users.listRoles() });
  }

  async listPermissions() {
    return Ok({ permissions: await this.deps.users.listPermissions() });
  }

  async setRolePermissions(
    ctx: HttpContext<{ permissions: string[] }, RouteParams<'/roles/:id/permissions'>>
  ) {
    try {
      return Ok({
        ...(await this.deps.users.setRolePermissions(Number(ctx.params.id), ctx.body!.permissions)),
      });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async createUser(ctx: HttpContext<CreateUserInput>) {
    try {
      const user = await this.deps.users.create(ctx.body!);
      return Created({ ...user });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async listUsers(ctx: HttpContext) {
    const query = ctx.query as { limit?: string; offset?: string; status?: 'active' | 'disabled' };
    const result = await this.deps.users.list({
      limit: Number(query.limit ?? 20),
      offset: Number(query.offset ?? 0),
      status: query.status,
    });
    return Ok({ ...result, users: result.users.map(user => ({ ...user })) });
  }

  async getUser(ctx: HttpContext<unknown, RouteParams<'/users/:id'>>) {
    try {
      return Ok({ ...(await this.deps.users.findById(Number(ctx.params.id))) });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async listAuthEvents(ctx: HttpContext<unknown, RouteParams<'/users/:id'>>) {
    const userId = Number(ctx.params.id);
    const query = ctx.query as { type?: (typeof authEventTypes)[number]; limit?: string };
    try {
      await this.deps.users.findById(userId);
      return Ok({
        events: await this.deps.events.list({
          userId,
          type: query.type,
          limit: Number(query.limit ?? 50),
        }),
      });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async updateUser(ctx: HttpContext<UpdateUserInput, RouteParams<'/users/:id'>>) {
    try {
      return Ok({ ...(await this.deps.users.update(Number(ctx.params.id), ctx.body!)) });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async setPassword(ctx: HttpContext<{ password: string }, RouteParams<'/users/:id/password'>>) {
    try {
      await this.deps.passwords.set(Number(ctx.params.id), ctx.body!.password);
      return NoContent();
    } catch (error) {
      if (error instanceof PasswordUserNotFoundError) throw NotFound(error.message);
      throw error;
    }
  }

  async deleteUser(ctx: HttpContext<unknown, RouteParams<'/users/:id'>>) {
    const userId = Number(ctx.params.id);
    if (ctx.user?.id === userId) throw Conflict('You cannot delete the current user');
    try {
      await this.deps.users.delete(userId);
      return NoContent();
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async createApiKey(ctx: HttpContext<CreateApiKeyBody, RouteParams<'/users/:id/api-keys'>>) {
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

  async listApiKeys(ctx: HttpContext<unknown, RouteParams<'/users/:id/api-keys'>>) {
    try {
      const apiKeys = await this.deps.apiKeys.list(Number(ctx.params.id));
      return Ok({ apiKeys: apiKeys.map(apiKey => ({ ...apiKey })) });
    } catch (error) {
      if (error instanceof ApiKeyUserNotFoundError) throw NotFound(error.message);
      throw error;
    }
  }

  async revokeApiKey(ctx: HttpContext<unknown, RouteParams<'/users/:id/api-keys/:keyId'>>) {
    try {
      await this.deps.apiKeys.revoke(Number(ctx.params.id), ctx.params.keyId);
      return NoContent();
    } catch (error) {
      if (error instanceof ApiKeyNotFoundError) throw NotFound(error.message);
      throw error;
    }
  }

  private serializeUser(ctx: HttpContext) {
    return ctx.user
      ? { id: ctx.user.id, roles: ctx.user.roles, permissions: ctx.user.permissions ?? [] }
      : null;
  }

  private handleUserError(error: unknown): never {
    if (error instanceof UnknownRolesError) {
      throw BadRequest(error.message, { roles: error.roles });
    }
    if (error instanceof UnknownPermissionsError) {
      throw BadRequest(error.message, { permissions: error.permissions });
    }
    if (error instanceof RoleNotFoundError) throw NotFound(error.message);
    if (error instanceof UserNotFoundError) throw NotFound(error.message);
    if (error instanceof DuplicateUserEmailError) {
      throw Conflict(error.message, { email: error.email });
    }
    throw error;
  }
}
