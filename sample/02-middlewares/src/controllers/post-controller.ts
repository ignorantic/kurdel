import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
  BadRequest,
  NotFound,
  Ok,
} from '@kurdel/core';
import { PostService } from 'services/post-service.js';

type Deps = PostService;

export class PostController extends Controller<Deps> {
  readonly routes: RouteConfig<Deps> = {
    getOne: route({ method: 'GET', path: '/post/:id' })(this.getOne),
    getAll: route({ method: 'GET', path: '/posts' })(this.getAll),
  };

  async getOne(ctx: HttpContext<Deps>): Promise<ActionResult> {
    const { id } = ctx.params;

    if (typeof id !== 'string') {
      throw BadRequest('ID is required');
    }

    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      throw BadRequest('ID must be a number');
    }

    const record = await ctx.deps.getPost(postId);
    if (!record) {
      throw NotFound('User not found');
    }

    return Ok(record);
  }

  async getAll(ctx: HttpContext<Deps>): Promise<ActionResult> {
    const records = await ctx.deps.getPosts();
    return Ok(records);
  }
}
