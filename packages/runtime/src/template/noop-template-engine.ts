import type { TemplateEngine } from '@kurdel/core/template';

export class NoopTemplateEngine implements TemplateEngine {
  async render(_t: string, _d: Record<string, unknown>): Promise<string> {
    throw new Error('No template engine configured.');
  }
}