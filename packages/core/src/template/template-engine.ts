export interface TemplateEngine {
  render(templatePath: string, data: Record<string, unknown>): Promise<string>;
}
