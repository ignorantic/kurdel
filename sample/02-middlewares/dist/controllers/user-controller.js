import { Controller, route, } from '@kurdel/core';
export class UserController extends Controller {
    routes = {
        getOne: route({ method: 'GET', path: '/user/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/users' })(this.getAll),
    };
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            return { kind: 'json', status: 400, body: { error: 'Id not found' } };
        }
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            return { kind: 'json', status: 400, body: { error: 'Invalid id' } };
        }
        try {
            const record = await ctx.deps.getUser(userId);
            return { kind: 'json', status: 200, body: record };
        }
        catch (err) {
            return { kind: 'json', status: 500, body: { error: String(err) } };
        }
    }
    async getAll(ctx) {
        try {
            const records = await ctx.deps.getUsers();
            return { kind: 'json', status: 200, body: records };
        }
        catch (err) {
            return { kind: 'json', status: 500, body: { error: String(err) } };
        }
    }
}
