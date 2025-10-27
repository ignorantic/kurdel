import { join } from 'node:path';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';

import { describe, it, expect } from 'vitest';

import { EjsEngine } from '../src/ejs-engine.js';

describe('EjsEngine', () => {
  const tmpDir = join(process.cwd(), 'views');
  const templatePath = join(tmpDir, 'hello.ejs');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(templatePath, `<h1>Hello, <%= name %>!</h1>`);
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('renders EJS template with data', async () => {
    const engine = new EjsEngine(tmpDir);
    const html = await engine.render('hello.ejs', { name: 'Kurdel' });

    expect(html).toContain('<h1>Hello, Kurdel!</h1>');
  });

  it('throws on missing template', async () => {
    const engine = new EjsEngine(tmpDir);
    await expect(engine.render('missing.ejs', {})).rejects.toThrow();
  });
});
