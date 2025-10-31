import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';

import { createNodeApplication } from '@kurdel/facade';
import { ReactTemplateModule } from '@kurdel/template-react';

import { HelloModule } from '../src/hello-module.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let server: any;

beforeAll(async () => {
  const app = await createNodeApplication({
    db: false,
    modules: [
      ReactTemplateModule.forRoot({
        baseDir: resolve(__dirname, '../src/views'),
      }),
      new HelloModule(),
    ],
  });

  server = app.listen(0);
});

afterAll(async () => {
  await server.close();
});

describe('Kurdel React Demo E2E', () => {
  it('renders home page', async () => {
    const res = await request(server.raw()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Welcome to React-powered templates!');
  });
});