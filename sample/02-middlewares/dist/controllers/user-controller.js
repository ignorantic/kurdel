import { Controller, route, BadRequest, NotFound, Ok, } from '@kurdel/core';
export class UserController extends Controller {
    routes = {
        getOne: route({ method: 'GET', path: '/user/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/users' })(this.getAll),
    };
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            throw BadRequest('ID is required');
        }
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            throw BadRequest('ID must be a number');
        }
        const record = await ctx.deps.service.getUser(userId);
        if (!record) {
            throw NotFound('User not found');
        }
        return Ok(record);
    }
    async getAll(ctx) {
        const records = await ctx.deps.service.getUsers();
        return Ok(records);
    }
}
