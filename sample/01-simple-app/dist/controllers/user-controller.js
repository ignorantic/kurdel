import { Controller, route, BadRequest, NotFound, Ok, Created, } from '@kurdel/core';
export class UserController extends Controller {
    routes = {
        create: route({ method: 'POST', path: '/user' })(this.create),
        getOne: route({ method: 'GET', path: '/user/:id' })(this.getOne),
        getAll: route({ method: 'GET', path: '/users' })(this.getAll),
    };
    async create(ctx) {
        const { name, role } = ctx.body ?? {};
        if (typeof name !== 'string') {
            throw BadRequest('Name is required');
        }
        if (typeof role !== 'string') {
            throw BadRequest('Role is required');
        }
        await ctx.deps.createUser(name, role);
        return Created();
    }
    async getOne(ctx) {
        const { id } = ctx.params;
        if (typeof id !== 'string') {
            throw BadRequest('ID is required');
        }
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            throw BadRequest('ID is required');
        }
        const record = await ctx.deps.getUser(userId);
        if (!record) {
            throw NotFound('User not found');
        }
        return Ok(record);
    }
    async getAll(ctx) {
        const records = await ctx.deps.getUsers();
        return Ok(records);
    }
}
