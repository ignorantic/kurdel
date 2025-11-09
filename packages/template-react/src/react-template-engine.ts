import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createElement, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

import type { TemplateEngine } from '@kurdel/core/template';

/**
 * ReactTemplateEngine
 *
 * Renders React components (views) into static HTML strings
 * for use in SSR (Server-Side Rendering).
 *
 * Responsibilities:
 * - Dynamically import the base Document and page component
 * - Compose them as a React element tree
 * - Convert the tree to an HTML string
 */
export class ReactTemplateEngine implements TemplateEngine {
  /** Base directory where `document.js` and view components reside */
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Renders a React view wrapped in the shared Document layout.
   *
   * @param view - The view component name (without .js extension)
   * @param data - Props to pass both to Document and the view
   * @returns Rendered HTML string with <!DOCTYPE html>
   */
  public async render(view: string, data: Record<string, unknown> = {}): Promise<string> {
    // 1️⃣ Load Document (HTML shell)
    const documentPath: string = path.resolve(this.baseDir, 'document.js');
    const documentUrl: string = pathToFileURL(documentPath).href;
    const documentModule: Record<string, any> = await import(documentUrl);
    const Document: React.FC<any> | undefined = documentModule.default;

    if (!Document) {
      throw new Error(`React document has no default export at ${documentPath}`);
    }

    // 2️⃣ Load view (React page component)
    const viewPath: string = path.resolve(this.baseDir, `${view}.js`);
    const viewUrl: string = pathToFileURL(viewPath).href;
    const viewModule: Record<string, any> = await import(viewUrl);
    const Component: React.FC<any> | undefined = viewModule.default;

    if (!Component) {
      throw new Error(`React view "${view}" has no default export at ${viewPath}`);
    }

    // 3️⃣ Compose React tree (Document → Component)
    const content: ReactElement = createElement(Component, data);
    const page: ReactElement = createElement(Document, data, content);

    // 4️⃣ Convert to HTML string with doctype prefix
    const html: string = renderToString(page);
    return '<!DOCTYPE html>' + html;
  }
}
