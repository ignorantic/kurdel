// tests/controller/controller.spec.ts
import { describe, it, expect } from 'vitest';
import { Controller } from '../../src/controller.js'; // your abstract one
import { createReqRes } from '../utils/http.js'; // mock from previous message
class UsersController extends Controller {
    routes = {
        index: { method: 'GET', path: '/users' },
    };
    // IMPORTANT: explicitly send response instead of returning it
    async index() {
        this.send(200, { ok: true, q: this.query });
    }
    _helper() { return 'secret'; } // must not be callable as action
}
// small helper for tests
async function execAction(ctrl, action, url = '/users?role=admin') {
    const { req, res, getResult } = createReqRes(url, 'GET');
    await ctrl.execute(req, res, action);
    return getResult();
}
describe('Controller', () => {
    it('calls existing action and sends JSON 200', async () => {
        const ctrl = new UsersController();
        const result = await execAction(ctrl, 'index', '/users?role=admin');
        expect(result.statusCode).toBe(200);
        expect((result.headers['content-type'] ?? '')).toContain('application/json');
        const payload = JSON.parse(result.body);
        expect(payload.ok).toBe(true);
        expect(payload.q.role).toBe('admin');
    });
    it('returns 404 for unknown action', async () => {
        const ctrl = new UsersController();
        const result = await execAction(ctrl, 'missingAction', '/users');
        expect(result.statusCode).toBe(404);
        // your abstract controller writes plain text; adjust if you send JSON there
        expect(result.body).toContain(`The method 'missingAction'`);
    });
    it('does not allow calling private/helper methods as actions', async () => {
        const ctrl = new UsersController();
        const result = await execAction(ctrl, '_helper', '/users');
        expect(result.statusCode).toBe(404);
    });
});
