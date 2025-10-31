import { TOKENS } from '@kurdel/core/tokens';
import type { Container } from '@kurdel/ioc';

import { NoopTemplateEngine } from 'src/template/noop-template-engine.js';

export function ensureTemplateEngineBinding(ioc: Container) {
  if (!ioc.has(TOKENS.TemplateEngineToken)) {
    ioc.bind(TOKENS.TemplateEngineToken).toInstance(new NoopTemplateEngine());
  }
}
