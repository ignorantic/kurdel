import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createExpressApplication } from '@kurdel/facade';
import { UserModule } from '../src/user-module.js';
describe('E2E: Authorization middleware with logging', () => {
    let app;
    let server;
    let rawServer;
    beforeAll(async () => {
        app = await createExpressApplication({
            modules: [new UserModule()],
            db: false,
        });
        server = app.listen(0);
        rawServer = server.raw?.();
        if (!rawServer)
            throw new Error('Server not started');
    });
    afterAll(async () => {
        await server.close();
    });
    it('return record with id=4', async () => {
        const res = await request(rawServer)
            .get('/users/4');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 4, name: 'Snaut' });
    });
    it('return four records', async () => {
        const res = await request(rawServer)
            .get('/users');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(4);
    });
});
