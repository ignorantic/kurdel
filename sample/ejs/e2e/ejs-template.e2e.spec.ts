import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';

import { createNodeApplication } from '@kurdel/facade';
import { EjsTemplateModule } from '@kurdel/template-ejs';

import { HomeModule } from '../src/home-module.js';
import { UserModule } from '../src/user-module.js';

let server: any;

beforeAll(async () => {
  const app = await createNodeApplication({
    db: false,
    modules: [
      EjsTemplateModule.forRoot({ baseDir: 'views' }),
      new UserModule(),
      new HomeModule(),
    ],
  });

  server = app.listen(0);
});

afterAll(async () => {
  await server.close();
});

describe('Kurdel EJS Demo E2E', () => {
  it('renders home page', async () => {
    const res = await request(server.raw()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Welcome to Kurdel Demo');
  });

  it('renders about page', async () => {
    const res = await request(server.raw()).get('/about');
    expect(res.status).toBe(200);
    expect(res.text).toContain('About Kurdel');
  });

  it('renders docs page', async () => {
    const res = await request(server.raw()).get('/docs');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Documentation');
  });

  it('renders users list (HTML)', async () => {
    const res = await request(server.raw()).get('/users');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<table');
  });

  it('renders single user', async () => {
    const res = await request(server.raw()).get('/users/1');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.text).toContain('<h1>');
    } else {
      expect(res.text).toContain('User not found');
    }
  });

  it('renders 404 page for missing route', async () => {
    const res = await request(server.raw()).get('/missing-page');
    expect(res.status).toBe(404);
    expect(res.text).toContain('Not Found');
  });

  it('renders 500 page for internal error', async () => {
    const res = await request(server.raw()).get('/users/-1');
    expect([500, 404]).toContain(res.status);
  });
});
