import type {
  RouteConfig,
  HttpContext,
  ActionResult,
  RouteParams} from '@kurdel/core/http';
import {
  Controller,
  route,
  BadRequest,
  NotFound,
  Ok
} from '@kurdel/core/http';
import type { PostService } from 'services/post-service.js';

type Deps = {
  service: PostService
};

export class PostController extends Controller<Deps> {
  readonly routes: RouteConfig = {
    getOne: route({ method: 'GET', path: '/:id' })(this.getOne),
    getAll: route({ method: 'GET', path: '/' })(this.getAll),
  };

  async getOne(ctx: HttpContext<unknown, RouteParams<'/:id'>>): Promise<ActionResult> {
    const { id } = ctx.params;

    if (typeof id !== 'string') {
      throw BadRequest('ID is required');
    }

    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      throw BadRequest('ID must be a number');
    }

    const record = await this.deps.service.getPost(postId);
    if (!record) {
      throw NotFound('User not found');
    }

    return Ok(record);
  }

  async getAll(): Promise<ActionResult> {
    const records = await this.deps.service.getPosts();
    return Ok(records);
  }
}
