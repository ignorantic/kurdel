import { Controller, route, HttpError, } from '@kurdel/core';
export class UserController extends Controller {
    routes = {
        getOne: route({ method: 'GET', path: '/user/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/users' })(this.getAll),
    };
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            throw new HttpError(400, 'ID is required');
        }
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            throw new HttpError(400, 'ID must be a number');
        }
        const record = await ctx.deps.getUser(userId);
        if (!record) {
            throw new HttpError(404, 'User not found');
        }
        return { kind: 'json', status: 200, body: record };
    }
    async getAll(ctx) {
        const records = await ctx.deps.getUsers();
        return { kind: 'json', status: 200, body: records };
    }
}
