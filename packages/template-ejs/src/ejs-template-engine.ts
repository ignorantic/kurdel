import ejs from 'ejs';
import type { TemplateEngine } from '@kurdel/core/template';

export class EjsTemplateEngine implements TemplateEngine {
  constructor(private readonly baseDir: string) {}

  async render(templatePath: string, data: Record<string, unknown>): Promise<string> {
    const filePath = `${this.baseDir}/${templatePath}`;
    return ejs.renderFile(filePath, data, { async: true }) as Promise<string>;
  }
}
