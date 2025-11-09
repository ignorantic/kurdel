import { describe, it, expect } from 'vitest';
import { ReactTemplateEngine } from '../src/react-template-engine.js';
import path from 'node:path';
import fs from 'node:fs/promises';

const TMP_DIR = path.resolve('tests/tmp/react-views');

describe('ReactTemplateEngine', async () => {
  // Prepare a temporary directory with mock React components
  await fs.mkdir(TMP_DIR, { recursive: true });

  await fs.writeFile(
    path.join(TMP_DIR, 'document.js'),
    `
      import React from 'react';
      
      export default function Document({ children }) {
        return React.createElement('html', null,
          React.createElement('body', null, children)
        );
      }
    `
  );

  const writeView = async (name: string, content: string) => {
    const file = path.join(TMP_DIR, `${name}.js`);
    await fs.writeFile(file, content);
    return file;
  };

  it('renders a simple React component to string', async () => {
    await writeView(
      'hello',
      `
        import React from 'react';
        export default function Hello() {
          return React.createElement('div', null, 'Hello React!');
        }
      `
    );

    const engine = new ReactTemplateEngine(TMP_DIR);
    const html = await engine.render('hello');

    expect(html).toContain('Hello React!');
    expect(html).toContain('<div');
  });

  it('renders component with props passed via data', async () => {
    await writeView(
      'user',
      `
        import React from 'react';
        export default function User({ name }) {
          return React.createElement('p', null, 'User: ' + name);
        }
      `
    );

    const engine = new ReactTemplateEngine(TMP_DIR);
    const html = await engine.render('user', { name: 'Ada' });

    expect(html).toContain('User: Ada');
  });

  it('throws if component has no default export', async () => {
    await writeView(
      'broken',
      `
        export const Broken = () => 'no default';
      `
    );

    const engine = new ReactTemplateEngine(TMP_DIR);
    await expect(engine.render('broken')).rejects.toThrow(/no default export/i);
  });
});
