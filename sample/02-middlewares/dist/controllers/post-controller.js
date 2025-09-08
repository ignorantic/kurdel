import { Controller, route, HttpError, } from '@kurdel/core';
export class PostController extends Controller {
    routes = {
        getOne: route({ method: 'GET', path: '/post/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/posts' })(this.getAll),
    };
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            throw new HttpError(400, 'ID is required');
        }
        const postId = Number(id);
        if (!Number.isFinite(postId)) {
            throw new HttpError(400, 'ID must be a number');
        }
        const record = await ctx.deps.getPost(postId);
        if (!record) {
            throw new HttpError(404, 'Post not found');
        }
        return { kind: 'json', status: 200, body: record };
    }
    async getAll(ctx) {
        const records = await ctx.deps.getPosts();
        return { kind: 'json', status: 200, body: records };
    }
}
