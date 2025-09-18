import { Controller, route, BadRequest, NotFound, Ok, } from '@kurdel/core';
export class PostController extends Controller {
    routes = {
        getOne: route({ method: 'GET', path: '/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/' })(this.getAll),
    };
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            throw BadRequest('ID is required');
        }
        const postId = Number(id);
        if (!Number.isFinite(postId)) {
            throw BadRequest('ID must be a number');
        }
        const record = await ctx.deps.service.getPost(postId);
        if (!record) {
            throw NotFound('User not found');
        }
        return Ok(record);
    }
    async getAll(ctx) {
        const records = await ctx.deps.service.getPosts();
        return Ok(records);
    }
}
