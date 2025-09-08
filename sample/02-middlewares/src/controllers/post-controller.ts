import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
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
      return { kind: 'json', status: 400, body: { error: 'Id not found' } };
    }

    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      return { kind: 'json', status: 400, body: { error: 'Invalid id' } };
    }

    try {
      const record = await ctx.deps.getPost(postId);
      return { kind: 'json', status: 200, body: record };
    } catch (err) {
      return { kind: 'json', status: 500, body: { error: String(err) } };
    }
  }

  async getAll(ctx: HttpContext<Deps>): Promise<ActionResult> {
    try {
      const records = await ctx.deps.getPosts();
      return { kind: 'json', status: 200, body: records };
    } catch (err) {
      return { kind: 'json', status: 500, body: { error: String(err) } };
    }
  }
}
