import path from 'node:path';
import { pathToFileURL } from 'node:url';

import React from 'react';
import { renderToString } from 'react-dom/server';

import type { TemplateEngine } from '@kurdel/core/template';

export class ReactTemplateEngine implements TemplateEngine {
  constructor(private readonly baseDir: string) {}

  async render(view: string, data: Record<string, unknown> = {}): Promise<string> {
    // Resolve path to the component file
    const viewPath = path.resolve(this.baseDir, `${view}.js`);
    const moduleUrl = pathToFileURL(viewPath).href;

    // Dynamically import component
    const mod = await import(moduleUrl);
    const Component = mod.default;

    if (!Component) throw new Error(`React view "${view}" has no default export`);

    // Render component to HTML string
    const element = React.createElement(Component, data);
    return renderToString(element);
  }
}
